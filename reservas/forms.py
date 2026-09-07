from django import forms

from .models import FotoPartido, Reserva, ResenaCancha, ResultadoPartido, ServicioAdicional


class ReservaForm(forms.ModelForm):
    servicios_adicionales = forms.ModelMultipleChoiceField(
        queryset=ServicioAdicional.objects.all(), required=False, widget=forms.CheckboxSelectMultiple
    )

    class Meta:
        model = Reserva
        fields = ('telefono', 'fecha', 'hora_inicio', 'servicios_adicionales')
        widgets = {
            'telefono': forms.TextInput(attrs={'type': 'tel', 'placeholder': 'Ej. 3001234567'}),
            'fecha': forms.DateInput(attrs={'type': 'date'}),
            'hora_inicio': forms.TimeInput(attrs={'type': 'time'}),
        }

    def clean_telefono(self):
        return ''.join(caracter for caracter in self.cleaned_data['telefono'] if caracter.isdigit())


class MisReservasForm(forms.Form):
    identificador = forms.CharField(
        label='E-mail o teléfono',
        max_length=150,
        widget=forms.TextInput(attrs={'placeholder': 'cliente@correo.com o 3001234567'}),
    )


class RegistroForm(forms.Form):
    nombre = forms.CharField(max_length=150, label='Nombre completo')
    email = forms.EmailField(label='E-mail')
    telefono = forms.CharField(max_length=30, label='Teléfono')
    password = forms.CharField(min_length=8, label='Contraseña', widget=forms.PasswordInput)

    def clean_email(self):
        return self.cleaned_data['email'].lower().strip()

    def clean_telefono(self):
        return ''.join(caracter for caracter in self.cleaned_data['telefono'] if caracter.isdigit())


class ResultadoPartidoForm(forms.ModelForm):
    class Meta:
        model = ResultadoPartido
        fields = ('equipo_a', 'equipo_b', 'goles_a', 'goles_b', 'mvp_partido', 'notas')
        widgets = {
            'goles_a': forms.NumberInput(attrs={'min': 0}),
            'goles_b': forms.NumberInput(attrs={'min': 0}),
            'notas': forms.Textarea(attrs={'rows': 2, 'placeholder': 'Detalles del partido (opcional)'}),
        }


class ResenaCanchaForm(forms.ModelForm):
    class Meta:
        model = ResenaCancha
        fields = ('nombre_jugador', 'puntuacion', 'comentario')
        widgets = {
            'puntuacion': forms.Select(),
            'comentario': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Cuéntanos tu experiencia'}),
        }


class FotoPartidoForm(forms.ModelForm):
    class Meta:
        model = FotoPartido
        fields = ('imagen',)
        widgets = {'imagen': forms.ClearableFileInput(attrs={'accept': 'image/*'})}