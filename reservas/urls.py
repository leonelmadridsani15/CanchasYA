from django.urls import path

from . import views

app_name = 'reservas'

urlpatterns = [
    path('', views.listar_canchas, name='listar_canchas'),
    path('cancha/<int:cancha_id>/', views.detalle_cancha, name='detalle_cancha'),
    path('mis-reservas/', views.mis_reservas, name='mis_reservas'),
    path('historial/', views.historial, name='historial'),
    path('historial/reserva/<int:reserva_id>/foto/', views.subir_foto_partido, name='subir_foto_partido'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/reserva/<int:reserva_id>/reactivar/', views.reactivar_reserva, name='reactivar_reserva'),
    path('reservar/<int:cancha_id>/', views.reservar_cancha, name='reservar_cancha'),
    path('turnos/<int:cancha_id>/', views.turnos_disponibles, name='turnos_disponibles'),
    path('pago/regreso/', views.pago_regreso, name='pago_regreso'),
    path('pago/simulado/<int:reserva_id>/', views.pago_simulado, name='pago_simulado'),
    path('pago/webhook/', views.pago_webhook, name='pago_webhook'),
]