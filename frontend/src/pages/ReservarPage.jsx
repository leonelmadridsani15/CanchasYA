import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, HORAS_TURNO, money } from '../lib/constants'

export default function ReservarPage() {
  const { canchaId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [cancha, setCancha] = useState(null)
  const [servicios, setServicios] = useState([])
  const [seleccionados, setSeleccionados] = useState([])
  const [telefono, setTelefono] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [ocupadas, setOcupadas] = useState([])
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    async function cargar() {
      const [canchaRes, serviciosRes] = await Promise.all([
        supabase.from(TABLES.cancha).select('*').eq('id', canchaId).eq('activa', true).single(),
        supabase.from(TABLES.servicioAdicional).select('*').order('id'),
      ])
      if (canchaRes.error) setError(canchaRes.error.message)
      else setCancha(canchaRes.data)
      if (!serviciosRes.error) setServicios(serviciosRes.data ?? [])
    }
    cargar()
  }, [canchaId])

  // Consulta de turnos ocupados (equivalente a turnos_disponibles del backend)
  useEffect(() => {
    async function cargarTurnos() {
      setHora('')
      if (!fecha) {
        setOcupadas([])
        return
      }
      const { data } = await supabase
        .from(TABLES.reserva)
        .select('hora_inicio')
        .eq('cancha_id', canchaId)
        .eq('fecha', fecha)
        .in('estado', ['pendiente', 'confirmada', 'bloqueada'])
      setOcupadas((data ?? []).map((r) => r.hora_inicio.slice(0, 5)))
    }
    cargarTurnos()
  }, [canchaId, fecha])

  const base = cancha ? Number(cancha.precio_por_hora) : 0
  const extras = servicios
    .filter((s) => seleccionados.includes(s.id))
    .reduce((sum, s) => sum + Number(s.precio), 0)
  const total = base + extras
  const sena = total / 2

  function alternarServicio(id) {
    setSeleccionados((actual) =>
      actual.includes(id) ? actual.filter((s) => s !== id) : [...actual, id],
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!hora) {
      setError('Elige una hora para continuar.')
      return
    }
    setGuardando(true)

    // Limpieza del teléfono (equivalente a clean_telefono del ReservaForm)
    const telefonoLimpio = telefono.replace(/\D/g, '')

    const { data, error: insertError } = await supabase
      .from(TABLES.reserva)
      .insert({
        usuario_auth_id: user.id,
        cancha_id: Number(canchaId),
        telefono: telefonoLimpio,
        fecha,
        hora_inicio: `${hora}:00`,
        estado: 'pendiente',
      })
      .select('id')
      .single()

    setGuardando(false)

    // Violación de la restricción única cancha+fecha+hora (código 23505)
    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Ese horario acaba de ser reservado. Elige otra fecha u hora.'
          : 'Ese horario ya está reservado. Elige otra fecha u hora.',
      )
      return
    }

    // Servicios adicionales (tabla intermedia M2M generada por Django)
    if (seleccionados.length > 0) {
      await supabase.from(TABLES.reservaServicios).insert(
        seleccionados.map((servicioId) => ({
          reserva_id: data.id,
          servicioadicional_id: servicioId,
        })),
      )
    }

    navigate(`/reserva-confirmada/${data.id}`)
  }

  if (error && !cancha) {
    return (
      <section className="min-h-screen bg-white px-5 pb-24 pt-36 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-300 bg-rose-100/60 p-10 text-center">
          <h1 className="text-2xl font-black text-rose-900">No pudimos cargar la cancha</h1>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      </section>
    )
  }

  if (!cancha) {
    return <section className="min-h-screen bg-white px-5 pt-36 text-center text-slate-500">Cargando…</section>
  }

  return (
    <section className="relative overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,.18),transparent_32%)]"></div>

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-36 lg:px-8 lg:pb-24">
        <Link to="/" className="text-sm font-bold text-emerald-600 transition hover:text-emerald-700">
          ← Todas las canchas
        </Link>
        <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Reserva tu turno</p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight sm:text-7xl">{cancha.nombre}</h1>
        <p className="mt-5 text-lg text-slate-500">
          Pasto {cancha.tipo_pasto} <span className="mx-2 text-emerald-600">·</span>{' '}
          <strong>{money(cancha.precio_por_hora)}</strong> por hora
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr]">
          {/* FORMULARIO */}
          <div className="rounded-3xl border border-emerald-900/50 bg-emerald-950 p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Tu reserva</p>
            <h2 className="mt-3 font-display text-2xl font-bold">Elige fecha y hora</h2>
            <p className="mt-4 text-sm leading-6 text-emerald-100">
              Tu reserva quedará asociada a <strong className="text-white">{user.email}</strong>.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div role="alert" aria-live="assertive" className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-sm font-medium text-red-300">
                  <strong className="block">Horario ocupado</strong>
                  {error}
                </div>
              )}

              {/* TELÉFONO */}
              <div>
                <label htmlFor="telefono" className="mb-2 block text-sm font-bold">Teléfono de contacto</label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 3001234567"
                  className="w-full rounded-xl border border-emerald-900 bg-black/40 px-4 py-3.5 font-semibold text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="mt-2 text-xs text-emerald-100/70">Lo usaremos para consultar tus reservas.</p>
              </div>

              {/* SERVICIOS ADICIONALES */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold">Servicios adicionales</label>
                  <span className="text-xs text-emerald-100/70">Opcionales</span>
                </div>
                <div className="space-y-2">
                  {servicios.length === 0 ? (
                    <p className="text-sm text-emerald-100/70">No hay servicios disponibles.</p>
                  ) : (
                    servicios.map((servicio) => (
                      <label
                        key={servicio.id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-emerald-900/50 bg-white p-3 text-slate-900 transition hover:border-emerald-600/60"
                      >
                        <span className="flex items-center gap-3 text-sm">
                          <input
                            type="checkbox"
                            checked={seleccionados.includes(servicio.id)}
                            onChange={() => alternarServicio(servicio.id)}
                            className="h-4 w-4 accent-emerald-600"
                          />
                          <span>{servicio.nombre}</span>
                        </span>
                        <span className="text-sm font-black text-emerald-600">+{money(servicio.precio)}</span>
                      </label>
                    ))
                  )}
                </div>
                <div className="mt-4 flex justify-between border-t border-emerald-900/50 pt-4 text-sm">
                  <span className="text-emerald-100">Total estimado</span>
                  <strong className="font-black text-emerald-600">{money(total)}</strong>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-emerald-100">Seña (50%)</span>
                  <strong className="font-black text-emerald-600">{money(sena)}</strong>
                </div>
              </div>

              {/* FECHA */}
              <div>
                <label htmlFor="fecha" className="mb-2 block text-sm font-bold">Fecha</label>
                <input
                  id="fecha"
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full rounded-xl border border-emerald-900 bg-black/40 px-4 py-3.5 font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* TURNOS DISPONIBLES */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold">Turnos disponibles</label>
                  <span className="text-sm font-semibold text-emerald-600">
                    {hora ? `Seleccionada: ${hora}` : 'Elige una hora'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {!fecha ? (
                    <p className="col-span-full rounded-xl border border-emerald-900/50 bg-white p-5 text-sm text-slate-500">
                      Selecciona una fecha para ver los turnos.
                    </p>
                  ) : (
                    HORAS_TURNO.map((h) => {
                      const ocupado = ocupadas.includes(h)
                      const activo = hora === h
                      return (
                        <button
                          key={h}
                          type="button"
                          data-turno
                          disabled={ocupado}
                          aria-pressed={activo}
                          onClick={() => setHora(h)}
                          className={[
                            'rounded-xl px-3 py-3 text-sm font-bold transition',
                            ocupado
                              ? 'cursor-not-allowed bg-emerald-950/50 text-slate-600 line-through'
                              : activo
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                                : 'bg-white text-slate-900 hover:border-emerald-600/60 hover:text-emerald-700',
                          ].join(' ')}
                        >
                          {h}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full rounded-2xl bg-emerald-600 px-6 py-4 font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Continuar al pago'} <span className="ml-2">→</span>
              </button>
            </form>
          </div>

          {/* IMAGEN LATERAL */}
          <div className="hidden min-h-[460px] overflow-hidden rounded-3xl lg:block">
            <img
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1300&q=90"
              alt="Campo de fútbol"
              className="h-full w-full object-cover"
            />
            <div className="relative mx-6 -mt-32 rounded-2xl bg-white/80 p-5 text-slate-900 backdrop-blur">
              <p className="font-display text-xl font-bold">Tu próximo partido, a un toque.</p>
              <p className="mt-1 text-sm text-slate-500">Horarios actualizados en tiempo real.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
