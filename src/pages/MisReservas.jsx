import { useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Search, Ticket, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, ESTADOS_RESERVA, fechaCorta } from '../lib/constants'
import BrandLogo, { BrandMark } from '../components/BrandLogo'

const estadoStyles = {
  confirmada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  pendiente: 'border-amber-200 bg-amber-50 text-amber-700',
  cancelada: 'border-rose-200 bg-rose-50 text-rose-700',
  bloqueada: 'border-slate-200 bg-slate-100 text-slate-600',
}

const estadoIconos = { confirmada: CheckCircle2, pendiente: Clock3, cancelada: XCircle, bloqueada: XCircle }

export default function MisReservas() {
  const { user } = useAuth()
  const [identificador, setIdentificador] = useState(user?.email || '')
  const [reservas, setReservas] = useState(null)
  const [error, setError] = useState(null)
  const [buscando, setBuscando] = useState(false)

  async function buscarReservas(ident) {
    setBuscando(true)
    setError(null)
    const limpio = ident.trim()
    const telefono = limpio.replace(/\D/g, '')
    const esEmail = limpio.includes('@')
    let query = supabase
      .from(TABLES.reserva)
      .select('*, cancha:reservas_cancha(nombre, formato_juego)')
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    if (esEmail && user && limpio.toLowerCase() === user.email?.toLowerCase()) {
      query = query.eq('usuario_auth_id', user.id)
    } else {
      query = query.eq('telefono', telefono)
    }

    const { data, error: queryError } = await query
    setBuscando(false)
    if (queryError) setError(queryError.message)
    else setReservas(data ?? [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await buscarReservas(identificador)
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#071426]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Link to="/#canchas" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-emerald-700">
            <ArrowLeft size={17} /> Volver a la página principal
          </Link>
          <BrandLogo />
        </div>
      </header>
      <section className="relative overflow-hidden bg-[#0B1B33] px-5 pb-24 pt-36 text-white lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.25em] text-lime-300">
            <Ticket size={17} /> Área de jugador
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-black tracking-tight sm:text-6xl">Tus reservas, siempre a mano.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Consulta horarios, estados y pagos de tus partidos en un solo lugar.</p>
        </div>
      </section>

      <section className="relative mx-auto -mt-12 max-w-5xl px-5 pb-20 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white p-5 shadow-xl shadow-[#071426]/10 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="identificador" className="mb-2 flex items-center gap-2 text-sm font-black text-[#071426]"><Search size={16} className="text-emerald-600" /> Buscar por e-mail o teléfono</label>
              <input id="identificador" type="text" required value={identificador} onChange={(e) => setIdentificador(e.target.value)} placeholder="cliente@correo.com o +56963557583" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
            <button type="submit" disabled={buscando} className="rounded-xl bg-[#16A34A] px-7 py-3.5 font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-lime-400 hover:text-[#071426] disabled:opacity-60">{buscando ? 'Buscando…' : 'Ver mis reservas'}</button>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Usa el mismo dato que ingresaste al momento de reservar.</p>
        </form>

        {error && <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm font-bold text-rose-700">{error}</div>}

        {reservas !== null && (
          reservas.length > 0 ? (
            <section className="mt-10">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Resultados</p><h2 className="mt-2 font-display text-3xl font-black">Tus turnos</h2></div>
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">{reservas.length} {reservas.length === 1 ? 'reserva' : 'reservas'}</span>
              </div>
              <div className="grid gap-4">
                {reservas.map((reserva) => {
                  const EstadoIcon = estadoIconos[reserva.estado] || Clock3
                  return (
                    <article key={reserva.id} className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg sm:p-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <BrandMark className="h-14 w-14 shrink-0 rounded-2xl" />
                          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">{reserva.cancha?.formato_juego?.replace('_', ' ') || 'Cancha deportiva'}</p><h3 className="mt-1 font-display text-2xl font-black">{reserva.cancha?.nombre || 'Cancha'}</h3><p className="mt-1 text-sm font-semibold text-slate-500">Reserva #{reserva.id}</p></div>
                        </div>
                        <span className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black ${estadoStyles[reserva.estado] || estadoStyles.pendiente}`}><EstadoIcon size={15} />{ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}</span>
                      </div>
                      <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                        <div className="flex items-center gap-3"><CalendarDays size={18} className="text-emerald-600" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Fecha</p><p className="mt-0.5 text-sm font-black">{fechaCorta(reserva.fecha)}</p></div></div>
                        <div className="flex items-center gap-3"><Clock3 size={18} className="text-emerald-600" /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Horario</p><p className="mt-0.5 text-sm font-black">{reserva.hora_inicio.slice(0, 5)} hrs</p></div></div>
                        <div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${reserva.mercadopago_payment_id ? 'bg-emerald-500' : 'bg-amber-400'}`} /><div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pago</p><p className={`mt-0.5 text-sm font-black ${reserva.mercadopago_payment_id ? 'text-emerald-700' : 'text-amber-700'}`}>{reserva.mercadopago_payment_id ? 'Seña pagada' : 'Pendiente'}</p></div></div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">📅</div><h2 className="mt-5 font-display text-2xl font-black">Todavía no hay reservas</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">No encontramos reservas con esos datos. Revisa la información o reserva tu próxima cancha.</p></div>
          )
        )}
      </section>
    </main>
  )
}
