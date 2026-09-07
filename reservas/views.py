from decimal import Decimal
from datetime import date, datetime, time
import json
from urllib.parse import quote
from uuid import uuid4

import mercadopago

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.contrib.auth.decorators import user_passes_test
from django.contrib.auth import login
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from django.db.models import Avg, Q

from .forms import FotoPartidoForm, MisReservasForm, RegistroForm, ResenaCanchaForm, ReservaForm, ResultadoPartidoForm
from .models import Cancha, FotoPartido, PerfilCliente, Reserva, ResenaCancha, ResultadoPartido

HORAS_TURNO = [time(hour=hora) for hora in range(8, 23)]


def _reserva_terminada(reserva):
	fecha_hora = datetime.combine(reserva.fecha, reserva.hora_inicio)
	fecha_hora = timezone.make_aware(fecha_hora, timezone.get_current_timezone())
	return fecha_hora <= timezone.now()


def _reservas_cliente(request, identificador=''):
	if request.user.is_authenticated:
		return Reserva.objects.filter(usuario=request.user).select_related('cancha').prefetch_related('servicios_adicionales', 'resultado_partido').order_by('fecha', 'hora_inicio')
	telefono = ''.join(caracter for caracter in identificador if caracter.isdigit())
	return Reserva.objects.filter(
		Q(usuario__email__iexact=identificador) | Q(telefono=telefono),
	).select_related('cancha').prefetch_related('servicios_adicionales', 'resultado_partido').order_by('fecha', 'hora_inicio')


def registro(request):
	form = RegistroForm(request.POST or None)
	if request.method == 'POST' and form.is_valid():
		with transaction.atomic():
			usuario = User.objects.filter(email__iexact=form.cleaned_data['email']).first()
			if usuario is None:
				usuario = User(username=form.cleaned_data['email'])
			usuario.email = form.cleaned_data['email']
			usuario.first_name = form.cleaned_data['nombre']
			usuario.set_password(form.cleaned_data['password'])
			usuario.save()
			PerfilCliente.objects.update_or_create(usuario=usuario, defaults={'telefono': form.cleaned_data['telefono']})
			Reserva.objects.filter(usuario__email__iexact=usuario.email).exclude(usuario=usuario).update(usuario=usuario)
		login(request, usuario)
		return redirect('reservas:historial')
	return render(request, 'registration/registro.html', {'form': form})


def _mercadopago_response(result):
	return result.get('response') or result.get('body') or {}


def _verificar_pago(payment_id):
	if not settings.MERCADOPAGO_ACCESS_TOKEN:
		return {}
	return _mercadopago_response(mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN).payment().get(payment_id))


def _confirmar_reserva(reserva, payment_id=None):
	if reserva.estado == 'confirmada' and reserva.confirmation_code:
		return False

	reserva.estado = 'confirmada'
	reserva.mercadopago_payment_id = payment_id or reserva.mercadopago_payment_id
	reserva.confirmation_code = f'CONF-{uuid4().hex[:10].upper()}'
	reserva.save(update_fields=['estado', 'mercadopago_payment_id', 'confirmation_code'])
	total_abonado = reserva.calcular_sena()
	send_mail(
		subject=f'Reserva confirmada - {reserva.cancha.nombre}',
		message=(
			f'Hola {reserva.usuario.get_full_name() or reserva.usuario.username},\n\n'
			f'Tu reserva ha sido confirmada.\n'
			f'Cancha: {reserva.cancha.nombre}\n'
			f'Fecha: {reserva.fecha:%d/%m/%Y}\n'
			f'Hora: {reserva.hora_inicio:%H:%M}\n'
			f'Total abonado (seña): ${total_abonado:,.2f}\n'
			f'Código de confirmación: {reserva.confirmation_code}\n'
		),
		from_email=settings.DEFAULT_FROM_EMAIL,
		recipient_list=[reserva.usuario.email],
		fail_silently=True,
	)
	return True


def _datos_pago(reserva):
	return reserva.calcular_total(), reserva.calcular_sena()


def _enlace_pago(request, reserva, cancha, sena):
	if not settings.MERCADOPAGO_ACCESS_TOKEN:
		return reverse('reservas:pago_simulado', args=[reserva.id])

	preference = {
		'items': [{
			'title': f'Seña - {cancha.nombre}',
			'quantity': 1,
			'unit_price': float(sena),
			'currency_id': 'COP',
		}],
		'external_reference': str(reserva.id),
		'back_urls': {
			'success': request.build_absolute_uri(reverse('reservas:pago_regreso')),
			'failure': request.build_absolute_uri(reverse('reservas:pago_regreso')),
			'pending': request.build_absolute_uri(reverse('reservas:pago_regreso')),
		},
		'auto_return': 'approved',
		'notification_url': request.build_absolute_uri(reverse('reservas:pago_webhook')),
	}
	try:
		result = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN).preference().create(preference)
		data = _mercadopago_response(result)
		return data.get('init_point') or data.get('sandbox_init_point') or reverse(
			'reservas:pago_simulado', args=[reserva.id]
		)
	except Exception:
		return reverse('reservas:pago_simulado', args=[reserva.id])


def listar_canchas(request):
	if request.user.is_authenticated and request.user.is_staff:
		return redirect('reservas:dashboard')
	canchas = Cancha.objects.filter(activa=True).prefetch_related('resenas').order_by('id')
	return render(request, 'reservas/canchas.html', {'canchas': canchas})


def detalle_cancha(request, cancha_id):
	cancha = get_object_or_404(Cancha, id=cancha_id, activa=True)
	resena_form = ResenaCanchaForm(request.POST or None)
	if request.method == 'POST' and request.user.is_authenticated and resena_form.is_valid():
		resena = resena_form.save(commit=False)
		resena.cancha = cancha
		resena.save()
		promedio = cancha.resenas.aggregate(promedio=Avg('puntuacion'))['promedio']
		cancha.calificacion_promedio = promedio
		cancha.save(update_fields=['calificacion_promedio'])
		return redirect('reservas:detalle_cancha', cancha_id=cancha.id)
	return render(request, 'reservas/detalle_cancha.html', {'cancha': cancha, 'resena_form': resena_form, 'resenas': cancha.resenas.order_by('-fecha_creacion')})


def mis_reservas(request):
	form = MisReservasForm(request.POST or None)
	reservas = None
	if request.method == 'POST' and form.is_valid():
		identificador = form.cleaned_data['identificador'].strip()
		telefono = ''.join(caracter for caracter in identificador if caracter.isdigit())
		reservas = Reserva.objects.filter(
			Q(usuario__email__iexact=identificador) | Q(telefono=telefono)
		).select_related('cancha').order_by('-fecha', '-hora_inicio')
	return render(request, 'reservas/mis_reservas.html', {'form': form, 'reservas': reservas})


def historial(request):
	consulta_form = MisReservasForm(request.POST or None)
	resultado_form = ResultadoPartidoForm()
	identificador = request.POST.get('identificador', '').strip()
	reservas = None
	proximos = []
	partidos = []
	pendientes = []
	canceladas = []
	jugador = request.user if request.user.is_authenticated else None

	if request.method == 'POST' and request.POST.get('action') == 'guardar_resultado':
		identificador = request.POST.get('identificador', '').strip()
		telefono = ''.join(caracter for caracter in identificador if caracter.isdigit())
		filtro_cliente = Q(usuario=request.user) if request.user.is_authenticated and not identificador else (
			Q(usuario__email__iexact=identificador) | Q(telefono=telefono)
		)
		reserva = Reserva.objects.filter(
			filtro_cliente,
			id=request.POST.get('reserva_id'),
			fecha__lte=date.today(),
		).select_related('cancha', 'usuario').first()
		resultado_form = ResultadoPartidoForm(request.POST)
		if reserva and _reserva_terminada(reserva) and resultado_form.is_valid() and not ResultadoPartido.objects.filter(reserva=reserva).exists():
			resultado = resultado_form.save(commit=False)
			resultado.reserva = reserva
			resultado.save()
			consulta_form = MisReservasForm({'identificador': identificador})

	if request.user.is_authenticated or (request.method == 'POST' and consulta_form.is_valid()):
		if request.method == 'POST' and consulta_form.is_valid():
			identificador = consulta_form.cleaned_data['identificador'].strip()
		reservas = list(_reservas_cliente(request, identificador))
		jugador = reservas[0].usuario if reservas else None
		for reserva in reservas:
			if reserva.estado == 'cancelada':
				canceladas.append(reserva)
			elif not _reserva_terminada(reserva):
				proximos.append(reserva)
			elif reserva.estado not in ['bloqueada']:
				resultado = getattr(reserva, 'resultado_partido', None)
				if resultado:
					partidos.append((reserva, resultado))
				else:
					pendientes.append(reserva)

	ganados = sum(resultado.goles_a > resultado.goles_b for _, resultado in partidos)
	perdidos = sum(resultado.goles_a < resultado.goles_b for _, resultado in partidos)
	return render(request, 'reservas/historial.html', {
		'consulta_form': consulta_form,
		'resultado_form': resultado_form,
		'jugador': jugador,
		'partidos': partidos,
		'pendientes': pendientes,
		'proximos': proximos,
		'canceladas': canceladas,
		'ahora': timezone.now(),
		'total_partidos': len(partidos),
		'goles_anotados': sum(resultado.goles_a for _, resultado in partidos),
		'ganados': ganados,
		'perdidos': perdidos,
		'identificador': request.POST.get('identificador', ''),
	})


@login_required
def subir_foto_partido(request, reserva_id):
	reserva = get_object_or_404(Reserva, id=reserva_id, usuario=request.user)
	resultado = get_object_or_404(ResultadoPartido, reserva=reserva)
	if request.method == 'POST':
		form = FotoPartidoForm(request.POST, request.FILES)
		if form.is_valid():
			foto = form.save(commit=False)
			foto.resultado = resultado
			foto.save()
	return redirect('reservas:historial')


@login_required
def turnos_disponibles(request, cancha_id):
	cancha = get_object_or_404(Cancha, id=cancha_id, activa=True)
	try:
		fecha = date.fromisoformat(request.GET.get('fecha', ''))
	except ValueError:
		fecha = None

	ocupadas = set()
	if fecha:
		ocupadas = set(Reserva.objects.filter(
			cancha=cancha,
			fecha=fecha,
			estado__in=['pendiente', 'confirmada', 'bloqueada'],
		).values_list('hora_inicio', flat=True))

	return render(request, 'reservas/turnos.html', {
		'horas': [(hora, hora in ocupadas) for hora in HORAS_TURNO],
		'fecha': fecha,
	})


@login_required(login_url='login')
@user_passes_test(lambda user: user.is_staff, login_url='login')
def dashboard(request):
	fecha = request.GET.get('fecha') or request.POST.get('fecha') or str(date.today())
	try:
		fecha = date.fromisoformat(fecha)
	except ValueError:
		fecha = date.today()

	if request.method == 'POST':
		reserva = get_object_or_404(Reserva, id=request.POST.get('reserva_id'))
		action = request.POST.get('action')
		if action == 'editar_turno':
			try:
				nueva_fecha = date.fromisoformat(request.POST.get('nueva_fecha', ''))
				nueva_hora = time.fromisoformat(request.POST.get('nueva_hora', ''))
			except ValueError:
				return redirect(f'{reverse("reservas:dashboard")}?fecha={fecha.isoformat()}')
			colision = Reserva.objects.filter(
				cancha=reserva.cancha, fecha=nueva_fecha, hora_inicio=nueva_hora,
			).exclude(id=reserva.id).exists()
			if not colision:
				reserva.fecha = nueva_fecha
				reserva.hora_inicio = nueva_hora
				reserva.save(update_fields=['fecha', 'hora_inicio'])
				telefono = ''.join(caracter for caracter in reserva.telefono if caracter.isdigit())
				if telefono:
					mensaje = (
						f'Hola {reserva.usuario.get_full_name() or reserva.usuario.username}, '
						f'tu reserva fue modificada. Nueva fecha: {nueva_fecha:%d/%m/%Y}, '
						f'hora: {nueva_hora:%H:%M}, cancha: {reserva.cancha.nombre}.'
					)
					return redirect(f'https://wa.me/{telefono}?text={quote(mensaje)}')
			return redirect(f'{reverse("reservas:dashboard")}?fecha={nueva_fecha.isoformat()}')
		if action == 'guardar_resultado' and _reserva_terminada(reserva):
			resultado_form = ResultadoPartidoForm(request.POST)
			if resultado_form.is_valid():
				ResultadoPartido.objects.update_or_create(
					reserva=reserva,
					defaults=resultado_form.cleaned_data,
				)
		elif action == 'bloquear' and reserva.estado not in ['cancelada', 'bloqueada']:
			reserva.estado = 'bloqueada'
			reserva.save(update_fields=['estado'])
		elif action == 'cancelar' and reserva.estado != 'cancelada':
			reserva.estado = 'cancelada'
			reserva.save(update_fields=['estado'])
		return redirect(f'{reverse("reservas:dashboard")}?fecha={fecha.isoformat()}')

	reservas = Reserva.objects.filter(fecha=fecha).select_related('cancha', 'usuario').prefetch_related('resultado_partido').order_by('hora_inicio', 'cancha__nombre')
	reservas_terminadas = {reserva.id for reserva in reservas if _reserva_terminada(reserva)}
	horas_dashboard = [f'{hora:02d}:00' for hora in range(8, 23)]
	return render(request, 'reservas/dashboard.html', {'reservas': reservas, 'fecha': fecha, 'resultado_form': ResultadoPartidoForm(), 'reservas_terminadas': reservas_terminadas, 'horas_dashboard': horas_dashboard})


@login_required(login_url='login')
@user_passes_test(lambda user: user.is_staff, login_url='login')
def reactivar_reserva(request, reserva_id):
	reserva = get_object_or_404(Reserva, id=reserva_id, estado='cancelada')
	if request.method != 'POST':
		return redirect(f'{reverse("reservas:dashboard")}?fecha={reserva.fecha.isoformat()}')

	ocupada = Reserva.objects.filter(
		cancha=reserva.cancha,
		fecha=reserva.fecha,
		hora_inicio=reserva.hora_inicio,
		estado__in=['pendiente', 'confirmada', 'bloqueada'],
	).exclude(id=reserva.id).exists()
	if ocupada:
		messages.error(request, 'No se puede reactivar: la cancha y horario ya fueron tomados por otra reserva')
	else:
		reserva.estado = 'confirmada'
		reserva.save(update_fields=['estado'])
		messages.success(request, 'La reserva fue reactivada correctamente y quedó confirmada.')
	return redirect(f'{reverse("reservas:dashboard")}?fecha={reserva.fecha.isoformat()}')


@login_required
def reservar_cancha(request, cancha_id):
	cancha = get_object_or_404(Cancha, id=cancha_id, activa=True)
	form = ReservaForm(request.POST or None)

	if request.method == 'POST' and form.is_valid():
		fecha = form.cleaned_data['fecha']
		hora_inicio = form.cleaned_data['hora_inicio']
		horario_ocupado = Reserva.objects.filter(
			cancha=cancha,
			fecha=fecha,
			hora_inicio=hora_inicio,
		).exists()

		if horario_ocupado:
			form.add_error(None, 'Ese horario ya está reservado. Elige otra fecha u hora.')
		else:
			reserva = form.save(commit=False)
			reserva.usuario = request.user
			reserva.cancha = cancha
			try:
				with transaction.atomic():
					reserva.save()
			except IntegrityError:
				form.add_error(None, 'Ese horario acaba de ser reservado. Elige otra fecha u hora.')
			else:
				form.save_m2m()
				total, sena = _datos_pago(reserva)
				payment_url = _enlace_pago(request, reserva, cancha, sena)
				return render(request, 'reservas/reserva_confirmada.html', {
					'reserva': reserva,
					'payment_url': payment_url,
					'sena': sena,
					'total': total,
					'simulacion': not settings.MERCADOPAGO_ACCESS_TOKEN or payment_url.startswith('/'),
				})

	return render(request, 'reservas/reservar.html', {'cancha': cancha, 'form': form})


@login_required
def pago_regreso(request):
	payment_id = request.GET.get('payment_id') or request.GET.get('collection_id')
	if not payment_id:
		return render(request, 'reservas/pago_resultado.html', {'error': 'No recibimos el identificador del pago.'})

	payment = _verificar_pago(payment_id)
	reserva = get_object_or_404(Reserva, id=payment.get('external_reference'), usuario=request.user)
	if payment.get('status') == 'approved' and payment.get('external_reference') == str(reserva.id):
		_confirmar_reserva(reserva, str(payment_id))
		total, total_abonado = _datos_pago(reserva)
		return render(request, 'reservas/pago_resultado.html', {'reserva': reserva, 'pagado': True, 'total': total, 'total_abonado': total_abonado})

	total, total_abonado = _datos_pago(reserva)
	return render(request, 'reservas/pago_resultado.html', {'reserva': reserva, 'pagado': False, 'total': total, 'total_abonado': total_abonado})


@login_required
def pago_simulado(request, reserva_id):
	reserva = get_object_or_404(Reserva, id=reserva_id, usuario=request.user)
	if reserva.estado != 'confirmada':
		_confirmar_reserva(reserva, f'PAY-TEST-{uuid4().hex[:8].upper()}')
	total, total_abonado = _datos_pago(reserva)
	return render(request, 'reservas/pago_resultado.html', {'reserva': reserva, 'pagado': True, 'simulado': True, 'total': total, 'total_abonado': total_abonado})


@csrf_exempt
def pago_webhook(request):
	if request.method != 'POST':
		return JsonResponse({'detail': 'Método no permitido'}, status=405)
	try:
		payload = json.loads(request.body or '{}')
		payment_id = payload.get('data', {}).get('id')
		if payload.get('type') != 'payment' or not payment_id:
			return JsonResponse({'detail': 'Notificación ignorada'})
		payment = _verificar_pago(payment_id)
		reserva_id = payment.get('external_reference')
		reserva = Reserva.objects.filter(id=reserva_id).first()
		if reserva and payment.get('status') == 'approved':
			_confirmar_reserva(reserva, str(payment_id))
		return JsonResponse({'ok': True})
	except (ValueError, TypeError, KeyError):
		return JsonResponse({'detail': 'Notificación inválida'}, status=400)
