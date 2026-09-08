import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, HORAS_TURNO, money } from '../lib/constants'
import Navbar from '../components/landing/Navbar'

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
      setError('Por favor elige un horario.')
      return
    }
    setGuardando(true)

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

    if (insertError) {
      setError(
        insertError.code === '23505'
          ? 'Ese horario se acaba de ocupar. Selecciona otro.'
          : 'Ocurrió un error al guardar la reserva.',
      )
      return
    }

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
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-md">
            <h1 className="text-xl font-bold text-rose-900">No pudimos cargar la cancha</h1>
            <p className="mt-2 text-sm text-rose-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cancha) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="py-20 text-center text-sm font-bold text-slate-400">
          Cargando opciones de reserva...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0c1e36]">
      <Navbar />

      <main className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          
          {/* ENCABEZADO PRINCIPAL */}
          <div className="relative overflow-hidden rounded-3xl border border-[#16a34a]/30 bg-gradient-to-r from-[#0d223d] via-[#0f2d47] to-[#0a1b2e] p-6 text-white shadow-xl sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[#16a34a]/25 blur-3xl"></div>
            <div className="pointer-events-none absolute -bottom-12 left-1/3 h-52 w-52 rounded-full bg-[#22c55e]/20 blur-2xl"></div>

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-block rounded-full border border-[#16a34a]/40 bg-[#16a34a]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-green-300 backdrop-blur-md">
                  Reserva en Línea
                </span>
                <h1 className="mt-2 font-display text-3xl font-black text-white sm:text-4xl">
                  {cancha.nombre}
                </h1>
                <p className="mt-1 text-sm font-semibold text-slate-200">
                  Superficie: <span className="font-bold text-green-400">Pasto {cancha.tipo_pasto}</span>
                </p>
              </div>

              <div className="rounded-2xl border border-[#16a34a]/30 bg-slate-950/40 p-4 text-left backdrop-blur-md md:text-right">
                <span className="block text-xs font-bold uppercase text-[#FAF9F6]">Precio hora</span>
                <span className="text-3xl font-black text-green-400">{money(cancha.precio_por_hora)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-12">
            
            {/* SECCIÓN DEL FORMULARIO DE RESERVA */}
            <div className="relative lg:col-span-7">
              
              {/* DIFUMINACIONES VERDE CLARITO ATRÁS DE LA TARJETA */}
              <div className="pointer-events-none absolute -left-12 -top-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"></div>
              <div className="pointer-events-none absolute -bottom-12 -right-10 h-72 w-72 rounded-full bg-green-300/30 blur-3xl"></div>

              <form 
                onSubmit={handleSubmit} 
                className="relative overflow-hidden rounded-3xl border border-slate-300 bg-white/95 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-sm sm:p-8"
              >
                {/* LUZ VERDE CLARITO INTERNA */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/50 blur-2xl"></div>

                <div className="relative z-10">
                  <h2 className="text-xl font-black text-[#0c1e36]">Completa tu reserva</h2>
                  <p className="text-xs font-bold text-slate-500">
                    Usuario: <span className="text-[#0c1e36]">{user.email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800">
                    ⚠️ {error}
                  </div>
                )}

                {/* TELÉFONO */}
                <div className="relative z-10 mt-6">
                  <label htmlFor="telefono" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Teléfono de Contacto *
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +56 9 1234 5678"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-[#0c1e36] shadow-sm transition placeholder:text-slate-400 focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  />
                </div>

                {/* FECHA */}
                <div className="relative z-10 mt-6">
                  <label htmlFor="fecha" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Fecha del partido *
                  </label>
                  <input
                    id="fecha"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-[#0c1e36] shadow-sm transition focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  />
                </div>

                {/* HORARIOS */}
                <div className="relative z-10 mt-6">
                  <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                      Horarios Disponibles *
                    </label>
                    <span className="text-xs font-black text-[#16a34a]">
                      {hora ? `Hora: ${hora}` : 'Selecciona una hora'}
                    </span>
                  </div>

                  {!fecha ? (
                    <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center text-xs font-bold text-slate-600">
                      Ingresa una fecha arriba para cargar las horas disponibles.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {HORAS_TURNO.map((h) => {
                        const ocupado = ocupadas.includes(h)
                        const activo = hora === h
                        return (
                          <button
                            key={h}
                            type="button"
                            disabled={ocupado}
                            onClick={() => setHora(h)}
                            className={`rounded-xl border py-3 text-xs font-black transition ${
                              ocupado
                                ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through'
                                : activo
                                  ? 'border-[#16a34a] bg-[#16a34a] text-white shadow-md shadow-[#16a34a]/30'
                                  : 'border-slate-300 bg-white text-[#0c1e36] hover:border-[#16a34a] hover:bg-emerald-50/80 hover:text-[#16a34a]'
                            }`}
                          >
                            {h}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ADICIONALES */}
                <div className="relative z-10 mt-6">
                  <label className="mb-3 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Servicios adicionales (Opcional)
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {servicios.length === 0 ? (
                      <p className="text-xs text-slate-400">No hay adicionales configurados.</p>
                    ) : (
                      servicios.map((servicio) => {
                        const marcado = seleccionados.includes(servicio.id)
                        return (
                          <label
                            key={servicio.id}
                            className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                              marcado
                                ? 'border-[#16a34a] bg-emerald-50/90 shadow-sm'
                                : 'border-slate-300 bg-white hover:border-[#16a34a] hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={marcado}
                                onChange={() => alternarServicio(servicio.id)}
                                className="h-4 w-4 rounded accent-[#16a34a]"
                              />
                              <span className="text-xs font-bold text-[#0c1e36]">{servicio.nombre}</span>
                            </div>
                            <span className="text-xs font-black text-[#16a34a]">+{money(servicio.precio)}</span>
                          </label>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* BOTÓN SUBMIT */}
                <button
                  type="submit"
                  disabled={guardando}
                  className="relative z-10 mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#16a34a] py-4 text-center text-sm font-black text-white shadow-lg shadow-[#16a34a]/25 transition hover:bg-[#15803d] disabled:opacity-50"
                >
                  <span>{guardando ? 'Guardando...' : 'Confirmar y pagar seña'}</span>
                  {!guardando && <span>→</span>}
                </button>
              </form>
            </div>

            {/* LATERAL DERECHO: RESUMEN Y FOTO */}
            <div className="flex flex-col gap-6 lg:col-span-5">
              
              {/* TARJETA RESUMEN */}
              <div className="relative overflow-hidden rounded-3xl border border-[#0c1e36]/20 bg-gradient-to-br from-[#0d223d] via-[#0f2a45] to-[#08182b] p-6 text-white shadow-xl">
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#16a34a]/20 blur-2xl"></div>

                <h3 className="relative z-10 text-base font-black text-white">Resumen del Turno</h3>
                
                <div className="relative z-10 mt-4 space-y-3 text-xs font-semibold text-slate-200">
                  <div className="flex justify-between">
                    <span>Cancha</span>
                    <span className="font-bold text-white">{money(base)}</span>
                  </div>
                  {extras > 0 && (
                    <div className="flex justify-between text-green-300">
                      <span>Adicionales</span>
                      <span className="font-bold">+{money(extras)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-700/60 pt-3 text-sm font-black text-white">
                    <span>Total estimado</span>
                    <span className="text-base text-green-400">{money(total)}</span>
                  </div>

                  <div className="flex justify-between rounded-2xl border border-[#16a34a]/40 bg-[#16a34a]/20 p-3.5 text-xs font-bold text-green-300 backdrop-blur-sm shadow-inner">
                    <span>Seña para abonar (50%)</span>
                    <span className="text-white font-extrabold">{money(sena)}</span>
                  </div>
                </div>
              </div>

              {/* TARJETA FOTO */}
              <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1300&q=90"
                  alt="Recinto deportivo"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d223d]/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-emerald-200/60 bg-white/90 p-4 text-[#0c1e36] backdrop-blur-md shadow-md">
                  <p className="font-display text-xs font-black uppercase text-[#16a34a]">Instalaciones Top</p>
                  <p className="text-sm font-extrabold">Iluminación LED y pasto sintético pro.</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  )
}