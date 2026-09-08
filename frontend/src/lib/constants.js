export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '56912345678'

// Bucket de Supabase Storage para fotos de partidos (media)
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'canchasya-media'

// Nombres de tablas (esquema generado por Django: <app>_<modelo>)
export const TABLES = {
  cancha: 'reservas_cancha',
  reserva: 'reservas_reserva',
  servicioAdicional: 'reservas_servicioadicional',
  resultadoPartido: 'reservas_resultadopartido',
  fotoPartido: 'reservas_fotopartido',
  reservaServicios: 'reservas_reserva_servicios_adicionales',
}

// Admins autorizados (equivalente a is_staff de Django). Vacío = todos los autenticados.
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const esAdmin = (user) =>
  Boolean(user) && (ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user.email?.toLowerCase()))

export const HORAS_TURNO = Array.from({ length: 15 }, (_, i) => `${String(i + 8).padStart(2, '0')}:00`)


export const ESTADOS_RESERVA = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  bloqueada: 'Bloqueada',
}

export const whatsappLink = (texto = 'Hola, quiero consultar por una reserva') =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`

export const money = (value) =>
  '$' + Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

export const FORMATOS = {
  futbol_5: 'Fútbol 5',
  futbol_7: 'Fútbol 7',
  futbol_11: 'Fútbol 11',
}

export const SUPERFICIES = {
  sintetico_fifa: 'Pasto Sintético FIFA Quality',
  natural: 'Pasto Natural',
  parquet_pista: 'Parquet/Pista',
}

export const IMAGENES_CANCHA = [
  '/img/canchas_1.jpg',
  '/img/canchas_2.jpg',
  '/img/canchas_3.jpg',
  '/img/canchas_4.jpg',
  '/img/canchas_5.jpg',
  '/img/canchas_6.jpg',
]

export const fechaCorta = (iso) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

