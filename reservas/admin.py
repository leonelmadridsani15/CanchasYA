from django.contrib import admin

from .models import Cancha, FotoPartido, PerfilCliente, Reserva, ResenaCancha, ResultadoPartido, ServicioAdicional


@admin.register(Cancha)
class CanchaAdmin(admin.ModelAdmin):
	list_display = ('nombre', 'tipo_pasto', 'precio_por_hora', 'activa')


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
	list_display = ('cancha', 'usuario', 'fecha', 'hora_inicio', 'estado')


@admin.register(ResultadoPartido)
class ResultadoPartidoAdmin(admin.ModelAdmin):
	list_display = ('reserva', 'equipo_a', 'goles_a', 'goles_b', 'equipo_b', 'mvp_partido')
	list_filter = ('reserva__fecha',)


@admin.register(PerfilCliente)
class PerfilClienteAdmin(admin.ModelAdmin):
	list_display = ('usuario', 'telefono')


@admin.register(ServicioAdicional)
class ServicioAdicionalAdmin(admin.ModelAdmin):
	list_display = ('nombre', 'precio', 'icono')


@admin.register(ResenaCancha)
class ResenaCanchaAdmin(admin.ModelAdmin):
	list_display = ('cancha', 'nombre_jugador', 'puntuacion', 'fecha_creacion')
	list_filter = ('puntuacion', 'cancha')


@admin.register(FotoPartido)
class FotoPartidoAdmin(admin.ModelAdmin):
	list_display = ('resultado', 'fecha_carga')
