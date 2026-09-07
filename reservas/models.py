from decimal import Decimal

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import User

class Cancha(models.Model):
    SUPERFICIES = [
        ('sintetico_fifa', 'Pasto Sintético FIFA Quality'),
        ('natural', 'Pasto Natural'),
        ('parquet_pista', 'Parquet/Pista'),
    ]
    FORMATOS = [('futbol_5', 'Fútbol 5'), ('futbol_7', 'Fútbol 7'), ('futbol_11', 'Fútbol 11')]

    nombre = models.CharField(max_length=100)
    tipo_pasto = models.CharField(max_length=50, choices=[('sintetico', 'Sintético'), ('natural', 'Natural')])
    precio_por_hora = models.DecimalField(max_digits=10, decimal_places=2)
    activa = models.BooleanField(default=True)
    tipo_superficie = models.CharField(max_length=30, choices=SUPERFICIES, default='sintetico_fifa')
    formato_juego = models.CharField(max_length=20, choices=FORMATOS, default='futbol_5')
    es_techada = models.BooleanField(default=False)
    iluminacion_led = models.BooleanField(default=True)
    calzado_permitido = models.CharField(max_length=180, default='Multitaco / Zapatillas de baby fútbol. No tapones de aluminio')
    tiene_vestuarios = models.BooleanField(default=False)
    tiene_estacionamiento = models.BooleanField(default=False)
    tiene_quincho = models.BooleanField(default=False)
    tiene_bar = models.BooleanField(default=False)
    tiene_wifi = models.BooleanField(default=False)
    tiene_tribunas = models.BooleanField(default=False)
    calificacion_promedio = models.DecimalField(max_digits=3, decimal_places=2, default=5.0)

    def __str__(self):
        return self.nombre

class Reserva(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('confirmada', 'Confirmada'),
        ('cancelada', 'Cancelada'),
        ('bloqueada', 'Bloqueada'),
    ]
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    cancha = models.ForeignKey(Cancha, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=30, blank=True)
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    mercadopago_payment_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    confirmation_code = models.CharField(max_length=20, blank=True, null=True, unique=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    servicios_adicionales = models.ManyToManyField('ServicioAdicional', blank=True, related_name='reservas')

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['cancha', 'fecha', 'hora_inicio'],
                name='reserva_cancha_fecha_hora_unicas',
            ),
        ]

    def __str__(self):
        return f"Reserva de {self.usuario.username} - {self.cancha.nombre} ({self.fecha} {self.hora_inicio})"

    def calcular_total(self):
        servicios = sum((servicio.precio for servicio in self.servicios_adicionales.all()), Decimal('0.00'))
        return self.cancha.precio_por_hora + servicios

    def calcular_sena(self):
        return (self.calcular_total() / 2).quantize(Decimal('0.01'))

    def calcular_saldo(self):
        return self.calcular_total() - self.calcular_sena()


class ServicioAdicional(models.Model):
    nombre = models.CharField(max_length=120)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    icono = models.CharField(max_length=30)

    def __str__(self):
        return self.nombre


class ResenaCancha(models.Model):
    cancha = models.ForeignKey(Cancha, on_delete=models.CASCADE, related_name='resenas')
    nombre_jugador = models.CharField(max_length=120)
    puntuacion = models.IntegerField(
        choices=[(valor, valor) for valor in range(1, 6)],
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comentario = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.cancha.nombre} - {self.puntuacion}/5'


class ResultadoPartido(models.Model):
    reserva = models.OneToOneField(
        Reserva,
        on_delete=models.CASCADE,
        related_name='resultado_partido',
    )
    equipo_a = models.CharField(max_length=100)
    equipo_b = models.CharField(max_length=100)
    goles_a = models.IntegerField(default=0)
    goles_b = models.IntegerField(default=0)
    mvp_partido = models.CharField(max_length=100, blank=True)
    notas = models.TextField(blank=True)

    def __str__(self):
        return f'{self.equipo_a} {self.goles_a} - {self.goles_b} {self.equipo_b}'


class FotoPartido(models.Model):
    resultado = models.ForeignKey(ResultadoPartido, on_delete=models.CASCADE, related_name='fotos')
    imagen = models.ImageField(upload_to='partidos/%Y/%m/')
    fecha_carga = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Foto de {self.resultado}'


class PerfilCliente(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil_cliente')
    telefono = models.CharField(max_length=30)

    def __str__(self):
        return self.usuario.email or self.usuario.username