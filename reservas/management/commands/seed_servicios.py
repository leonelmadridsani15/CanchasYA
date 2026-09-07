from django.core.management.base import BaseCommand

from reservas.models import ServicioAdicional


class Command(BaseCommand):
	def handle(self, *args, **options):
		servicios = [
			('Alquiler de Balón Profesional', '2000', 'ball'),
			('Juego de Petos', '1000', 'tshirt'),
			('Servicio de Árbitro', '15000', 'whistle'),
			('Reserva de Quincho', '10000', 'fire'),
		]
		for nombre, precio, icono in servicios:
			ServicioAdicional.objects.update_or_create(nombre=nombre, defaults={'precio': precio, 'icono': icono})
		self.stdout.write(self.style.SUCCESS('Servicios adicionales iniciales cargados.'))