import { useCallback, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, ESTADOS_RESERVA, HORAS_TURNO, fechaCorta, esAdmin } from '../lib/constants'
import { Calendar, Search, CheckCircle, Clock, Ban, AlertCircle, Edit, RotateCcw, Trophy, Users, X } from 'lucide-react'

const estadoIcon = { confirmada: CheckCircle, pendiente: Clock, cancelada: Ban, bloqueada: AlertCircle }

const estadoStyle = {
  confirmada: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  pendiente: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  cancelada: { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  bloqueada: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', dot: 'bg-slate-400' },
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [modalReprogramar, setModalReprogramar] = useState(null)
  const [modalResultado, setModalResultado] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const esAdminUser = esAdmin(user)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from(TABLES.reserva)
        .select('*, cancha:reservas_cancha(nombre), resultado_partido:reservas_resultadopartido(*)')
        .eq('fecha', fecha)
        .order('hora_inicio')
        .order('cancha_id')
      if (err) throw err
      setReservas(data ?? [])
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [fecha])

  useEffect(() => {
    if (esAdminUser) cargar()
  }, [esAdminUser, cargar])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500"></div>
          <p className="text-slate-400">Cargando panel...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (!esAdminUser) return <Navigate to="/" replace />

  const terminada = (r) => new Date(r.fecha + 'T' + r.hora_inicio) <= new Date()

  const reservasFiltradas = reservas.filter((r) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      r.nombre_contacto?.toLowerCase().includes(term) ||
      r.email_contacto?.toLowerCase().includes(term) ||
      r.cancha?.nombre?.toLowerCase().includes(term)
    )
  })

  async function accion(id, action) {
    const update = { estado: action === 'cancelar' ? 'cancelada' : 'bloqueada' }
    const { error } = await supabase.from(TABLES.reserva).update(update).eq('id', id)
    setMensaje(error ? { tipo: 'error', texto: error.message } : { tipo: 'ok', texto: action === 'cancelar' ? 'Reserva cancelada.' : 'Reserva bloqueada.' })
    cargar()
  }

  async function reactivar(reserva) {
    const { data: ocupada } = await supabase.from(TABLES.reserva).select('id')
      .eq('cancha_id', reserva.cancha_id).eq('fecha', reserva.fecha)
      .eq('hora_inicio', reserva.hora_inicio)
      .in('estado', ['pendiente', 'confirmada', 'bloqueada']).neq('id', reserva.id)
    if ((ocupada ?? []).length > 0) {
      setMensaje({ tipo: 'error', texto: 'No se puede reactivar: la cancha y horario ya fueron tomados.' })
      return
    }
    const { error } = await supabase.from(TABLES.reserva).update({ estado: 'confirmada' }).eq('id', reserva.id)
    setMensaje(error ? { tipo: 'error', texto: error.message } : { tipo: 'ok', texto: 'Reserva reactivada.' })
    cargar()
  }

  const stats = {
    total: reservas.length,
    confirmadas: reservas.filter((r) => r.estado === 'confirmada').length,
    pendientes: reservas.filter((r) => r.estado === 'pendiente').length,
    canceladas: reservas.filter((r) => r.estado === 'cancelada').length,
  }

  const statCards = [
    { label: 'Total', value: stats.total, icon: Calendar, color: 'text-slate-300', bg: 'bg-[#1a1f2d]', border: 'border-white/5' },
    { label: 'Confirmadas', value: stats.confirmadas, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Canceladas', value: stats.canceladas, icon: Ban, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0d1322] to-[#0a0f1a] text-slate-200">
      <header className="border-b border-white/5 bg-[#0d1322]/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-emerald-400 transition hover:text-emerald-300">← Volver al sitio</Link>
              <div className="h-6 w-px bg-white/10"></div>
              <h1 className="font-display text-3xl font-black text-white">Panel de Control</h1>
            </div>
            <Link to="/mis-reservas" className="text-sm text-slate-400 hover:text-white">Mis Reservas</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0d1322] px-4 py-2.5">
              <Calendar className="h-5 w-5 text-emerald-400" />
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border-none bg-transparent text-white outline-none" />
            </div>
            <button onClick={cargar} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">Actualizar</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Buscar por cliente o cancha…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 rounded-xl border border-white/10 bg-[#0d1322] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>

        {mensaje && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium ${
            mensaje.tipo === 'ok' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
          }`}>
            <span className="text-lg">{mensaje.tipo === 'ok' ? '✓' : '⚠'}</span>
            {mensaje.texto}
            <button onClick={() => setMensaje(null)} className="ml-auto text-lg">×</button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className={`rounded-2xl border p-5 ${card.border} ${card.bg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
                    <p className={`mt-2 font-display text-3xl font-black ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`rounded-xl bg-white/5 p-2.5 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d1322]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-black">Hora</th>
                  <th className="px-6 py-4 font-black">Cancha</th>
                  <th className="px-6 py-4 font-black">Cliente</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Marcador</th>
                  <th className="px-6 py-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cargando ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center"><div className="flex items-center justify-center gap-3 text-slate-400"><div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>Cargando reservas…</div></td></tr>
                ) : reservasFiltradas.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-3"><span className="text-5xl">📭</span><p className="font-bold text-slate-500">{searchTerm ? 'No se encontraron reservas' : 'No hay reservas para este día'}</p></div></td></tr>
                ) : (
                  reservasFiltradas.map((reserva) => {
                    const r = reserva.resultado_partido?.[0]
                    const turnoTerminado = terminada(reserva)
                    const IconState = estadoIcon[reserva.estado] || Clock
                    const ec = estadoColor(reserva.estado)
                    return (
                      <tr key={reserva.id} className="transition hover:bg-white/[0.02]">
                        <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 font-mono text-sm font-bold text-white">⏰ {reserva.hora_inicio?.slice(0, 5)}</span></td>
                        <td className="px-6 py-4 font-semibold text-white">{reserva.cancha?.nombre ?? `Cancha ${reserva.cancha_id}`}</td>
                        <td className="px-6 py-4"><div className="font-semibold text-white">{reserva.nombre_contacto}</div><div className="text-xs text-slate-500">{reserva.email_contacto}</div></td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${ec.bg} ${ec.text} ${ec.border}`}>{/* @ts-ignore */} <IconState className="h-3 w-3" /> {ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}</span></td>
                        <td className="px-6 py-4">
                          {r ? (
                            <div className="flex items-center gap-2"><span className="rounded-lg bg-emerald-500/10 px-3 py-1 font-mono text-lg font-black text-emerald-400">{r.goles_a}</span><span className="text-slate-600">-</span><span className="rounded-lg bg-white/5 px-3 py-1 font-mono text-lg font-black text-white">{r.goles_b}</span></div>
                          ) : turnoTerminado ? (<span className="text-xs text-slate-500">Sin cargar</span>) : (<span className="text-xs text-slate-600">Pendiente</span>)}
                        </td>
                        <td className="px-6 py-4"><div className="flex flex-wrap justify-end gap-2">
                          {reserva.estado !== 'cancelada' ? (
                            <>
                              <button type="button" onClick={() => setModalReprogramar({ id: reserva.id, cliente: reserva.nombre_contacto, cancha: reserva.cancha?.nombre, cancha_id: reserva.cancha_id, fecha: reserva.fecha, hora: reserva.hora_inicio })} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"><Edit className="h-3 w-3" /> Editar</button>
                              {turnoTerminado && !r && (<button type="button" onClick={() => setModalResultado({ id: reserva.id, equipo_a: reserva.equipo_a, equipo_b: reserva.equipo_b, goles_a: '', goles_b: '', mvp_partido: '', notas: '' })} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">+ Resultado</button>)}
                              {turnoTerminado && r && (<button type="button" onClick={() => setModalResultado({ id: reserva.id, equipo_a: r.equipo_a, equipo_b: r.equipo_b, goles_a: r.goles_a, goles_b: r.goles_b, mvp_partido: r.mvp_partido, notas: r.notas })} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">Editar resultado</button>)}
                              <button type="button" onClick={() => accion(reserva.id, 'cancelar')} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"><Ban className="h-3 w-3" /> Cancelar</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => reactivar(reserva)} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400"><CheckCircle className="h-3 w-3" /> Reactivar</button>
                          )}
                        </div></td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL REPROGRAMAR */}
      {modalReprogramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1f2d] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-white">Editar reserva</h2>
              <button type="button" className="text-2xl text-slate-500 transition hover:text-white" onClick={() => setModalReprogramar(null)}>×</button>
            </div>
            <p className="mt-2 text-sm text-slate-400">{modalReprogramar.cliente} · {modalReprogramar.cancha}</p>
            <form className="mt-6 space-y-5" onSubmit={async (e) => {
              e.preventDefault()
              const datos = Object.fromEntries(new FormData(e.target))
              const { data: colision } = await supabase
                .from(TABLES.reserva).select('id')
                .eq('cancha_id', modalReprogramar.cancha_id)
                .eq('fecha', datos.nueva_fecha)
                .eq('hora_inicio', datos.nueva_hora)
                .in('estado', ['pendiente', 'confirmada', 'bloqueada'])
                .neq('id', modalReprogramar.id)
              if ((colision ?? []).length > 0) {
                setMensaje({ tipo: 'error', texto: 'Ese horario ya está ocupado.' })
                setModalReprogramar(null)
                return
              }
              const { error } = await supabase
                .from(TABLES.reserva)
                .update({ fecha: datos.nueva_fecha, hora_inicio: datos.nueva_hora })
                .eq('id', modalReprogramar.id)
              setMensaje(error ? { tipo: 'error', texto: error.message } : { tipo: 'ok', texto: `Reserva movida al ${fechaCorta(datos.nueva_fecha)} a las ${datos.nueva_hora}.` })
              setModalReprogramar(null)
              cargar()
            }}>
              <label className="block text-sm font-bold text-slate-300">
                Nueva fecha
                <input name="nueva_fecha" type="date" required defaultValue={modalReprogramar.fecha} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>
              <label className="block text-sm font-bold text-slate-300">
                Nueva hora
                <select name="nueva_hora" required defaultValue={modalReprogramar.hora} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  {HORAS_TURNO.map((h) => (<option key={h} value={h} className="bg-[#0d1322]">{h}</option>))}
                </select>
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalReprogramar(null)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10">Cancelar</button>
                <button className="rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESULTADO */}
      {modalResultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#1a1f2d] p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-white">Cargar resultado</h2>
              <button type="button" className="text-2xl text-slate-500 transition hover:text-white" onClick={() => setModalResultado(null)}>×</button>
            </div>
            <form className="mt-6 grid grid-cols-2 gap-5" onSubmit={async (e) => {
              e.preventDefault()
              const datos = Object.fromEntries(new FormData(e.target))
              const payload = {
                reserva_id: Number(datos.reserva_id),
                equipo_a: datos.equipo_a,
                equipo_b: datos.equipo_b,
                goles_a: Number(datos.goles_a),
                goles_b: Number(datos.goles_b),
                mvp_partido: datos.mvp_partido || '',
                notas: datos.notas || '',
              }
              const { error } = await supabase.from(TABLES.resultadoPartido).upsert(payload, { onConflict: 'reserva_id' })
              setMensaje(error ? { tipo: 'error', texto: error.message } : { tipo: 'ok', texto: 'Resultado guardado.' })
              setModalResultado(null)
              cargar()
            }}>
              <input type="hidden" name="reserva_id" value={modalResultado.id} />
              <label className="col-span-2 text-sm font-bold text-slate-300">Equipo Local<input name="equipo_a" required defaultValue={modalResultado.equipo_a ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-300">Equipo Visitante<input name="equipo_b" required defaultValue={modalResultado.equipo_b ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="text-sm font-bold text-slate-300">Goles Local<input name="goles_a" type="number" min="0" required defaultValue={modalResultado.goles_a ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="text-sm font-bold text-slate-300">Goles Visitante<input name="goles_b" type="number" min="0" required defaultValue={modalResultado.goles_b ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-300">MVP del partido<input name="mvp_partido" defaultValue={modalResultado.mvp_partido ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-300">Notas<textarea name="notas" rows="3" defaultValue={modalResultado.notas ?? ''} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea></label>
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalResultado(null)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10">Cancelar</button>
                <button className="rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
