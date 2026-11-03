import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, ESTADOS_RESERVA, HORAS_TURNO, fechaCorta, esAdmin } from '../lib/constants'
import { Calendar, Search, CheckCircle, Clock, Ban, AlertCircle, Edit } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'

const estadoIcon = { confirmada: CheckCircle, pendiente: Clock, cancelada: Ban, bloqueada: AlertCircle }

const estadoStyle = {
  confirmada: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  pendiente: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  cancelada: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  bloqueada: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
}

const estadoColor = (estado) => estadoStyle[estado] ?? estadoStyle.pendiente

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
      <div className="flex min-h-screen items-center justify-center bg-[#ECFDF3]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500"></div>
          <p className="text-slate-500">Cargando panel...</p>
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

  function notificarReserva(reserva, tipo, nuevaFecha = reserva.fecha, nuevaHora = reserva.hora_inicio) {
    const fecha = fechaCorta(nuevaFecha)
    const hora = nuevaHora.slice(0, 5)
    const mensaje = tipo === 'cancelada'
      ? `Hola ${reserva.nombre_contacto || ''}, te informamos que tu reserva en ${reserva.cancha?.nombre || 'CanchaYa'} para el ${fecha} a las ${hora} fue cancelada.`
      : `Hola ${reserva.nombre_contacto || ''}, tu reserva en ${reserva.cancha?.nombre || 'CanchaYa'} fue reprogramada para el ${fecha} a las ${hora}.`
    const telefono = (reserva.telefono || '').replace(/\D/g, '')
    if (telefono) {
      const whatsappNumber = telefono.startsWith('56') ? telefono : `56${telefono}`
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer')
    }

  }

  async function accion(reserva, action) {
    const update = { estado: action === 'cancelar' ? 'cancelada' : 'bloqueada' }
    const { error } = await supabase.from(TABLES.reserva).update(update).eq('id', reserva.id)
    if (error) {
      setMensaje({ tipo: 'error', texto: error.message })
    } else {
      try {
        if (action === 'cancelar') await notificarReserva(reserva, 'cancelada')
        setMensaje({ tipo: 'ok', texto: action === 'cancelar' ? 'Reserva cancelada y aviso preparado para WhatsApp.' : 'Reserva bloqueada.' })
      } catch (notificationError) {
        setMensaje({ tipo: 'error', texto: notificationError.message })
      }
    }
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
    { label: 'Total', value: stats.total, icon: Calendar, color: 'text-slate-700', bg: 'bg-white/90', border: 'border-emerald-200' },
    { label: 'Confirmadas', value: stats.confirmadas, icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50/90', border: 'border-emerald-200' },
    { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Canceladas', value: stats.canceladas, icon: Ban, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  ]
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#071426]">
      <header className="border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-emerald-700 transition hover:text-emerald-900">← Volver al sitio</Link>
              <div className="h-6 w-px bg-emerald-200"></div>
              <BrandLogo />
              <div className="hidden h-6 w-px bg-emerald-200 sm:block"></div>
              <h1 className="hidden font-display text-2xl font-black text-[#071426] sm:block">Panel de control</h1>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Administrador</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 lg:py-8">
        <div className="rounded-[2rem] border border-emerald-100 bg-[#F3FBEF] p-5 shadow-xl shadow-[#071426]/10 sm:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 shadow-sm">
              <Calendar className="h-5 w-5 text-emerald-700" />
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border-none bg-transparent font-semibold text-[#071426] outline-none" />
            </div>
            <button onClick={cargar} className="rounded-xl bg-[#166534] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#15803D]">Actualizar</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Buscar por cliente o cancha…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 rounded-xl border border-emerald-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#071426] placeholder-slate-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
        </div>

        {mensaje && (
          <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium ${
            mensaje.tipo === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'
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
                  <div className={`rounded-xl bg-slate-100 p-2.5 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#193653] bg-[#0B1B33] shadow-xl shadow-[#071426]/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#193653] bg-[#102A47] text-xs uppercase tracking-wider text-emerald-200">
                  <th className="px-6 py-4 font-black">Hora</th>
                  <th className="px-6 py-4 font-black">Cancha</th>
                  <th className="px-6 py-4 font-black">Cliente</th>
                  <th className="px-6 py-4 font-black">Estado</th>
                  <th className="px-6 py-4 font-black">Marcador</th>
                  <th className="px-6 py-4 font-black text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#193653]">
                {cargando ? (
                  <tr><td colSpan="6" className="px-6 py-20 text-center"><div className="flex items-center justify-center gap-3 text-slate-500"><div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>Cargando reservas…</div></td></tr>
                ) : reservasFiltradas.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-16 text-center"><div className="flex flex-col items-center gap-3"><span className="text-5xl">📭</span><p className="font-bold text-slate-500">{searchTerm ? 'No se encontraron reservas' : 'No hay reservas para este día'}</p></div></td></tr>
                ) : (
                  reservasFiltradas.map((reserva) => {
                    const r = reserva.resultado_partido?.[0]
                    const turnoTerminado = terminada(reserva)
                    const IconState = estadoIcon[reserva.estado] || Clock
                    const ec = estadoColor(reserva.estado)
                    return (
                      <tr key={reserva.id} className="transition hover:bg-[#102A47]">
                        <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 font-mono text-sm font-bold text-white">⏰ {reserva.hora_inicio?.slice(0, 5)}</span></td>
                        <td className="px-6 py-4 font-semibold text-white">{reserva.cancha?.nombre ?? `Cancha ${reserva.cancha_id}`}</td>
                        <td className="px-6 py-4"><div className="font-semibold text-white">{reserva.nombre_contacto || 'Cliente registrado'}</div><div className="text-xs text-slate-400">{reserva.email_contacto || 'Sin correo'}</div><div className="text-xs text-emerald-200">{reserva.telefono || 'Sin teléfono'}</div></td>
                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${ec.bg} ${ec.text} ${ec.border}`}>{/* @ts-ignore */} <IconState className="h-3 w-3" /> {ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}</span></td>
                        <td className="px-6 py-4">
                          {r ? (
                            <div className="flex items-center gap-2"><span className="rounded-lg bg-emerald-50 px-3 py-1 font-mono text-lg font-black text-emerald-700">{r.goles_a}</span><span className="text-slate-400">-</span><span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-lg font-black text-slate-700">{r.goles_b}</span></div>
                          ) : turnoTerminado ? (<span className="text-xs text-slate-500">Sin cargar</span>) : (<span className="text-xs text-slate-600">Pendiente</span>)}
                        </td>
                        <td className="px-6 py-4"><div className="flex flex-wrap justify-end gap-2">
                          {reserva.estado !== 'cancelada' ? (
                            <>
                              <button type="button" onClick={() => setModalReprogramar({ ...reserva, cliente: reserva.nombre_contacto, cancha: reserva.cancha?.nombre })} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700"><Edit className="h-3 w-3" /> Editar</button>
                              {turnoTerminado && !r && (<button type="button" onClick={() => setModalResultado({ id: reserva.id, equipo_a: reserva.equipo_a, equipo_b: reserva.equipo_b, goles_a: '', goles_b: '', mvp_partido: '', notas: '' })} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">+ Resultado</button>)}
                              {turnoTerminado && r && (<button type="button" onClick={() => setModalResultado({ id: reserva.id, equipo_a: r.equipo_a, equipo_b: r.equipo_b, goles_a: r.goles_a, goles_b: r.goles_b, mvp_partido: r.mvp_partido, notas: r.notas })} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">Editar resultado</button>)}
                              <button type="button" onClick={() => accion(reserva, 'cancelar')} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 transition hover:bg-rose-500/20"><Ban className="h-3 w-3" /> Cancelar</button>
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
        </div>
      </main>

      {/* MODAL REPROGRAMAR */}
      {modalReprogramar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-[#071426] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#071426]">Editar reserva</h2>
              <button type="button" className="text-2xl text-slate-500 transition hover:text-white" onClick={() => setModalReprogramar(null)}>×</button>
            </div>
            <p className="mt-2 text-sm text-slate-500">{modalReprogramar.cliente || 'Cliente registrado'} · {modalReprogramar.cancha}</p>
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
              if (error) {
                setMensaje({ tipo: 'error', texto: error.message })
              } else {
                try {
                  await notificarReserva(modalReprogramar, 'reprogramada', datos.nueva_fecha, datos.nueva_hora)
                  setMensaje({ tipo: 'ok', texto: `Reserva movida al ${fechaCorta(datos.nueva_fecha)} a las ${datos.nueva_hora}. Aviso preparado para WhatsApp.` })
                } catch (notificationError) {
                  setMensaje({ tipo: 'error', texto: notificationError.message })
                }
              }
              setModalReprogramar(null)
              cargar()
            }}>
              <label className="block text-sm font-bold text-slate-600">
                Nueva fecha
                <input name="nueva_fecha" type="date" required defaultValue={modalReprogramar.fecha} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </label>
              <label className="block text-sm font-bold text-slate-600">
                Nueva hora
                <select name="nueva_hora" required defaultValue={modalReprogramar.hora} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  {HORAS_TURNO.map((h) => (<option key={h} value={h}>{h}</option>))}
                </select>
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalReprogramar(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                <button className="rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RESULTADO */}
      {modalResultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-[#071426] shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-[#071426]">Cargar resultado</h2>
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
              <label className="col-span-2 text-sm font-bold text-slate-600">Equipo Local<input name="equipo_a" required defaultValue={modalResultado.equipo_a ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-600">Equipo Visitante<input name="equipo_b" required defaultValue={modalResultado.equipo_b ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="text-sm font-bold text-slate-600">Goles Local<input name="goles_a" type="number" min="0" required defaultValue={modalResultado.goles_a ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="text-sm font-bold text-slate-600">Goles Visitante<input name="goles_b" type="number" min="0" required defaultValue={modalResultado.goles_b ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-600">MVP del partido<input name="mvp_partido" defaultValue={modalResultado.mvp_partido ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" /></label>
              <label className="col-span-2 text-sm font-bold text-slate-600">Notas<textarea name="notas" rows="3" defaultValue={modalResultado.notas ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea></label>
              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalResultado(null)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50">Cancelar</button>
                <button className="rounded-xl bg-emerald-500 px-5 py-3 font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-400">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
