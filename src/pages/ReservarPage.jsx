import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CarFront,
  Check,
  CircleDot,
  Clock3,
  Flame,
  Lightbulb,
  MapPin,
  Phone,
  ShieldCheck,
  ShowerHead,
  Utensils,
  Umbrella,
  Wifi,
} from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import BrandLogo from '../components/BrandLogo'
import {
  FORMATOS,
  HORAS_TURNO,
  IMAGENES_CANCHA,
  SUPERFICIES,
  TABLES,
} from '../lib/constants'

const formatMoney = (value) =>
  `$${Number(value || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}`

const today = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 10)
}

const serviciosOcultos = ['arbitro profesional', 'fotografo del partido', 'set de pelotas']

const nombreServicio = (nombre = '') => nombre.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const iconoServicio = (nombre = '') => {
  const nombreNormalizado = nombreServicio(nombre)
  if (nombreNormalizado.includes('arbitro')) return ShieldCheck
  if (nombreNormalizado.includes('pelota')) return CircleDot
  if (nombreNormalizado.includes('peto') || nombreNormalizado.includes('chaleco')) return Building2
  if (nombreNormalizado.includes('hidrat')) return Wifi
  return CircleDot
}

const instalacionesCancha = [
  [Wifi, 'WiFi', 'tiene_wifi'],
  [Flame, 'Quincho', 'tiene_quincho'],
  [ShowerHead, 'Vestuarios', 'tiene_vestuarios'],
  [CarFront, 'Estacionamiento', 'tiene_estacionamiento'],
  [Utensils, 'Bar', 'tiene_bar'],
  [Building2, 'Tribunas', 'tiene_tribunas'],
  [Lightbulb, 'Iluminación LED', 'iluminacion_led'],
  [Umbrella, 'Cancha techada', 'es_techada'],
]

export default function ReservarPage() {
  const { canchaId } = useParams()
  const { user } = useAuth()
  const [cancha, setCancha] = useState(null)
  const [servicios, setServicios] = useState([])
  const [fecha, setFecha] = useState(today)
  const [hora, setHora] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ocupadas, setOcupadas] = useState([])
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      setTelefono(user.phone || user.user_metadata?.telefono || '')
    }
  }, [user?.id])

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      const [canchaResponse, serviciosResponse] = await Promise.all([
        supabase.from(TABLES.cancha).select('*').eq('id', canchaId).single(),
        supabase.from(TABLES.servicioAdicional).select('*').order('id'),
      ])

      if (canchaResponse.error) setError(`No pudimos cargar la cancha: ${canchaResponse.error.message}`)
      else setCancha(canchaResponse.data)

      if (serviciosResponse.error) {
        setError(`No pudimos cargar los servicios adicionales: ${serviciosResponse.error.message}`)
      } else {
        setServicios(
          (serviciosResponse.data ?? []).filter(
            (servicio) => !serviciosOcultos.includes(nombreServicio(servicio.nombre)),
          ),
        )
      }
      setCargando(false)
    }

    cargarDatos()
  }, [canchaId])

  useEffect(() => {
    async function cargarDisponibilidad() {
      if (!canchaId || !fecha) return
      setCargandoHorarios(true)
      setHora('')
      const { data, error: queryError } = await supabase
        .from(TABLES.reserva)
        .select('hora_inicio')
        .eq('cancha_id', canchaId)
        .eq('fecha', fecha)
        .in('estado', ['pendiente', 'confirmada'])

      if (queryError) setError(`No pudimos consultar los horarios: ${queryError.message}`)
      else setOcupadas((data ?? []).map((reserva) => reserva.hora_inicio.slice(0, 5)))
      setCargandoHorarios(false)
    }

    cargarDisponibilidad()
  }, [canchaId, fecha])

  const horariosDisponibles = useMemo(
    () => HORAS_TURNO.filter((horario) => !ocupadas.includes(horario)),
    [ocupadas],
  )

  const serviciosElegidos = servicios.filter((servicio) => serviciosSeleccionados.includes(servicio.id))
  const precioCancha = Number(cancha?.precio_por_hora || 0)
  const precioServicios = serviciosElegidos.reduce((total, servicio) => total + Number(servicio.precio || 0), 0)
  const total = precioCancha + precioServicios
  const sena = Math.round(total / 2)

  function alternarServicio(id) {
    setServiciosSeleccionados((actuales) =>
      actuales.includes(id) ? actuales.filter((actual) => actual !== id) : [...actuales, id],
    )
  }

  async function handleReservar() {
    if (!hora || !cancha || !user) return
    if (!telefono.trim()) {
      setError('Ingresa un número de teléfono para que el administrador pueda contactarte.')
      return
    }
    setProcesando(true)
    setError(null)

    try {
      const { data: reserva, error: reservaError } = await supabase
        .from(TABLES.reserva)
        .insert({
          usuario_auth_id: user.id,
          nombre_contacto: user.user_metadata?.nombre || 'Cliente registrado',
          email_contacto: user.email || '',
          cancha_id: Number(canchaId),
          fecha,
          hora_inicio: hora,
          telefono: telefono.trim(),
          estado: 'pendiente',
        })
        .select('id')
        .single()

      if (reservaError) {
        if (reservaError.code === '23505') throw new Error('Ese horario acaba de ser reservado. Elige otro.')
        throw new Error(`No pudimos crear la reserva: ${reservaError.message}`)
      }

      if (serviciosElegidos.length > 0) {
        const { error: serviciosError } = await supabase
          .from(TABLES.reservaServicios)
          .insert(serviciosElegidos.map((servicio) => ({
            reserva_id: reserva.id,
            servicioadicional_id: servicio.id,
          })))

        if (serviciosError) throw new Error(`No pudimos agregar los servicios: ${serviciosError.message}`)
      }

      const { data: preference, error: preferenceError } = await supabase.functions.invoke(
        'mercadopago-preference',
        {
          body: {
            reserva_id: String(reserva.id),
            precio_total: sena,
            title: `Seña CanchaYa - ${cancha.nombre} (${fecha} ${hora})`,
          },
        },
      )

      if (preferenceError) throw new Error(preferenceError.message)
      if (!preference?.init_point) throw new Error('Mercado Pago no devolvió la URL de pago.')
      window.location.href = preference.init_point
    } catch (reservationError) {
      console.error('Error al procesar reserva:', reservationError)
      setError(reservationError.message || 'Ocurrió un error inesperado.')
      setProcesando(false)
    }
  }

  if (cargando) {
    return <div className="min-h-screen bg-[#FAF9F6] px-5 py-32 text-center font-bold text-slate-500">Cargando cancha…</div>
  }

  if (!cancha) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] px-5 py-32 text-center">
        <p className="font-bold text-rose-700">{error || 'No encontramos esta cancha.'}</p>
        <Link to="/#canchas" className="mt-5 inline-block font-bold text-emerald-700">Volver a canchas</Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-16 text-[#071426]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 lg:px-8">
          <Link to="/#canchas" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-emerald-700">
            <ArrowLeft size={17} /> Volver a canchas
          </Link>
          <BrandLogo />
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 pt-10 lg:px-8 lg:pt-14">
        <div className="mb-10">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-700">Reserva online</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Arma tu próximo partido.</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Elige el día, encuentra un horario libre y agrega todo lo que tu equipo necesita.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-52">
                <img src={IMAGENES_CANCHA[Number(canchaId) % IMAGENES_CANCHA.length]} alt={cancha.nombre} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/80 to-transparent" />
                <div className="absolute bottom-5 left-6 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300">{FORMATOS[cancha.formato_juego] ?? cancha.formato_juego}</p>
                  <h2 className="mt-1 font-display text-3xl font-black">{cancha.nombre}</h2>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 px-6 py-5 text-sm font-semibold text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin size={16} className="text-emerald-600" /> {SUPERFICIES[cancha.tipo_superficie] ?? cancha.tipo_superficie}</span>
                <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-emerald-600" /> {formatMoney(precioCancha)} / hora</span>
              </div>
              <div className="border-t border-slate-100 px-6 py-6">
                <h3 className="text-lg font-black text-[#071426]">Características del lugar</h3>
                <p className="mt-1 text-sm text-slate-500">Revisa qué incluye esta cancha antes de reservar.</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {instalacionesCancha.map(([icono, nombre, propiedad]) => {
                      const Icono = icono
                      const disponible = Boolean(cancha[propiedad])
                      return (
                      <div
                        key={propiedad}
                        className={`rounded-2xl border px-3 py-3 ${disponible ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <Icono size={19} strokeWidth={2} className={disponible ? 'text-emerald-700' : 'text-slate-400'} aria-hidden="true" />
                        <p className={`mt-2 text-xs font-black ${disponible ? 'text-emerald-800' : 'text-slate-500'}`}>{nombre}</p>
                        <p className={`mt-0.5 text-[11px] font-bold ${disponible ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {disponible ? 'Disponible' : 'No disponible'}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <strong className="text-[#071426]">Calzado permitido:</strong>{' '}
                  {cancha.calzado_permitido || 'Consulta las condiciones en recepción.'}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Phone size={21} /></span>
                <div>
                  <h2 className="text-xl font-black">Tus datos de contacto</h2>
                  <p className="mt-1 text-sm text-slate-500">El administrador usará este número para confirmar tu reserva.</p>
                </div>
              </div>
              <label htmlFor="telefono-reserva" className="mt-6 block text-sm font-black text-[#071426]">Número de teléfono</label>
              <input
                id="telefono-reserva"
                type="tel"
                required
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="Ej: +56 9 1234 5678"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:max-w-md"
              />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><CalendarDays size={21} /></span>
                <div>
                  <h2 className="text-xl font-black">1. Elige el día</h2>
                  <p className="mt-1 text-sm text-slate-500">Las reservas tienen una duración de una hora.</p>
                </div>
              </div>
              <input type="date" min={today()} value={fecha} onChange={(event) => setFecha(event.target.value)} className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-bold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:w-auto" />

              <div className="mt-8 flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Clock3 size={21} /></span>
                <div>
                  <h2 className="text-xl font-black">2. Selecciona un horario</h2>
                  <p className="mt-1 text-sm text-slate-500">{cargandoHorarios ? 'Consultando disponibilidad…' : `${horariosDisponibles.length} horarios disponibles`}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
                {HORAS_TURNO.map((horario) => {
                  const disponible = horariosDisponibles.includes(horario)
                  const seleccionado = hora === horario
                  return (
                    <button key={horario} type="button" disabled={!disponible || cargandoHorarios} onClick={() => setHora(horario)} className={`rounded-xl border px-3 py-3 text-sm font-black transition ${seleccionado ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : disponible ? 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700' : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through'}`}>
                      {horario}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><ShieldCheck size={21} /></span>
                <div>
                  <h2 className="text-xl font-black">3. Suma servicios adicionales</h2>
                  <p className="mt-1 text-sm text-slate-500">Opcionales para que solo te preocupes de jugar.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {servicios.length === 0 ? <p className="text-sm text-slate-500">No hay servicios adicionales disponibles.</p> : servicios.map((servicio) => {
                  const seleccionado = serviciosSeleccionados.includes(servicio.id)
                  return (
                    <button key={servicio.id} type="button" onClick={() => alternarServicio(servicio.id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${seleccionado ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}>
                      {(() => {
                        const IconoServicio = iconoServicio(servicio.nombre)
                        return <IconoServicio size={24} className="shrink-0 text-emerald-700" aria-hidden="true" />
                      })()}
                      <span className="min-w-0 flex-1"><strong className="block text-sm">{servicio.nombre}</strong><small className="mt-1 block font-bold text-emerald-700">{formatMoney(servicio.precio)}</small></span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${seleccionado ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 text-transparent'}`}><Check size={14} /></span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-3xl bg-[#0B1B33] p-6 text-white shadow-xl shadow-emerald-950/15 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-lime-300">Resumen de reserva</p>
              <h2 className="mt-3 font-display text-2xl font-black">{cancha.nombre}</h2>
              <div className="mt-6 space-y-4 border-b border-white/10 pb-6 text-sm">
                <div className="flex justify-between gap-4"><span className="text-slate-400">Fecha</span><strong>{fecha.split('-').reverse().join('/')}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Horario</span><strong>{hora || 'Selecciona un horario'}</strong></div>
                <div className="flex justify-between gap-4"><span className="text-slate-400">Cancha</span><strong>{formatMoney(precioCancha)}</strong></div>
                {serviciosElegidos.map((servicio) => <div key={servicio.id} className="flex justify-between gap-4 text-xs"><span className="text-slate-400">{servicio.nombre}</span><strong>{formatMoney(servicio.precio)}</strong></div>)}
              </div>
              <div className="flex items-end justify-between py-6"><span className="text-sm text-slate-400">Total</span><strong className="font-display text-3xl font-black">{formatMoney(total)}</strong></div>
              {error && <div className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/15 p-3 text-sm font-semibold text-rose-100">{error}</div>}
              <button type="button" disabled={!hora || procesando} onClick={handleReservar} className="w-full rounded-xl bg-[#16A34A] py-4 text-sm font-black text-white transition hover:bg-lime-400 hover:text-[#071426] disabled:cursor-not-allowed disabled:opacity-50">
                {procesando ? 'Preparando pago…' : `Pagar seña de ${formatMoney(sena)}`}
              </button>
              <div className="mt-5 flex gap-2 text-xs leading-5 text-slate-400"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-lime-300" />Reserva segura. Solo pagarás el 50% para confirmar tu horario.</div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
