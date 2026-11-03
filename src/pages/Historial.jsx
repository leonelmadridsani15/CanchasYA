import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, fechaCorta } from '../lib/constants'
import ProximoPartido from '../components/historial/ProximoPartido'
import PartidoPasado from '../components/historial/PartidoPasado'
import FormularioResultado from '../components/historial/FormularioResultado'
import BrandLogo from '../components/BrandLogo'

export default function Historial() {
  const { user } = useAuth()
  const [datos, setDatos] = useState({ proximos: [], partidos: [], pendientes: [], canceladas: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  function clasificar(reservas) {
    const ahora = new Date()
    const proximos = []
    const partidos = []
    const pendientes = []
    const canceladas = []
    for (const reserva of reservas) {
      if (reserva.estado === 'cancelada') canceladas.push(reserva)
      else if (new Date(`${reserva.fecha}T${reserva.hora_inicio}`) > ahora) proximos.push(reserva)
      else if (reserva.estado !== 'bloqueada') {
        if (reserva.resultado_partido) partidos.push(reserva)
        else pendientes.push(reserva)
      }
    }
    return { proximos, partidos, pendientes, canceladas }
  }

  function recargar() {
    if (!user) return
    setCargando(true)
    supabase
      .from(TABLES.reserva)
      .select(
        '*, cancha:reservas_cancha(nombre, formato_juego), resultado_partido:reservas_resultadopartido(*, fotos:reservas_fotopartido(*))',
      )
      .eq('usuario_auth_id', user.id)
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .then(({ data, error: queryError }) => {
        if (queryError) setError(queryError.message)
        else setDatos(clasificar(data ?? []))
        setCargando(false)
      })
  }

  useEffect(recargar, [user?.id])

  const { proximos, partidos, pendientes, canceladas } = datos
  const ganados = partidos.filter((r) => r.resultado_partido.goles_a > r.resultado_partido.goles_b).length
  const perdidos = partidos.filter((r) => r.resultado_partido.goles_a < r.resultado_partido.goles_b).length
  const golesAnotados = partidos.reduce((sum, r) => sum + r.resultado_partido.goles_a, 0)

  const kpis = [
    { etiqueta: ['Partidos', 'Jugados'], valor: partidos.length },
    { etiqueta: ['Partidos', 'Ganados'], valor: ganados },
    { etiqueta: ['Goles', 'Anotados'], valor: golesAnotados },
    { etiqueta: ['Partidos', 'Perdidos'], valor: perdidos },
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#071426]">
        <header className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
            <Link to="/#canchas" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-emerald-700">
              <ArrowLeft size={17} /> Volver a la página principal
            </Link>
            <BrandLogo />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-5 pb-24 pt-28 lg:px-8">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-emerald-700">
            Match Pass
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Tu perfil de jugador</h1>
          <div className="mt-8 rounded-2xl border border-emerald-900/50 bg-emerald-950 p-8 text-center text-slate-400">
            Inicia sesión para ver tu historial de partidos y reservas.
            <div className="mt-5 flex justify-center gap-3">
              <Link to="/login" className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700">
                Ingresar
              </Link>
              <Link to="/registro" className="rounded-xl border border-emerald-900/60 px-6 py-3 font-bold text-slate-300 transition hover:border-emerald-600 hover:text-emerald-400">
                Registrarse
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#071426]">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 lg:px-8">
          <Link to="/#canchas" className="inline-flex items-center gap-2 text-sm font-black text-slate-600 transition hover:text-emerald-700">
            <ArrowLeft size={17} /> Volver a la página principal
          </Link>
          <BrandLogo />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0B1B33] px-6 py-9 text-white shadow-xl shadow-[#071426]/10 sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-lime-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20M2 12h20" />
            </svg>
            Match Pass
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-black tracking-tight sm:text-6xl">Tu historial de partidos</h1>
          <p className="mt-4 text-sm text-slate-300">{user.email}</p>
            </div>
          <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-black text-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-300"></span>
            </span>
            Jugador Amateur ⚽
          </span>
          </div>
        </section>

        {cargando ? (
          <p className="mt-10 text-center text-sm font-bold text-slate-500">Cargando perfil…</p>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-rose-300 bg-rose-100/60 p-6 text-sm font-bold text-rose-700">{error}</div>
        ) : (
          <>
            {/* KPIs / Estadísticas superiores */}
            <section className="mt-8">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi) => (
                  <div key={kpi.valor + kpi.etiqueta.join()} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 7l4.76 3.45-1.82 5.6H9.06l-1.82-5.6L12 7z" />
                        </svg>
                      </div>
                      <p className="text-xs font-black text-slate-500">
                        {kpi.etiqueta[0]}
                        <br />
                        {kpi.etiqueta[1]}
                      </p>
                    </div>
                    <p className="mt-3 font-display text-4xl font-black text-[#071426]">{kpi.valor}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PRÓXIMOS PARTIDOS */}
            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Agenda</p><h2 className="mt-2 font-display text-3xl font-black tracking-tight">Próximos partidos</h2></div>
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-700">{proximos.length} próximos</span>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {proximos.length === 0 ? (
                  <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                    No tenés próximos partidos confirmados. ¡Reservá tu turno! 🏟️
                  </p>
                ) : (
                  proximos.map((reserva) => <ProximoPartido key={reserva.id} reserva={reserva} />)
                )}
              </div>
            </section>

            {/* PARTIDOS PASADOS · Marcador Deportivo de TV */}
            <section className="mt-14">
              <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Tu rendimiento</p><h2 className="mt-2 font-display text-3xl font-black tracking-tight">Partidos pasados</h2></div>
              <div className="mt-6 space-y-6">
                {partidos.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-500">
                    Aún no hay partidos con resultado cargado.
                  </p>
                ) : (
                  partidos.map((reserva) => <PartidoPasado key={reserva.id} reserva={reserva} alGuardar={recargar} />)
                )}
              </div>
            </section>

            {/* PARTIDOS SIN RESULTADO */}
            {pendientes.length > 0 && (
              <section className="mt-16">
                <h2 className="font-display text-3xl font-black tracking-tight">Cargar resultado</h2>
                <p className="mt-2 text-sm text-slate-500">Registra el marcador de tus partidos terminados.</p>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {pendientes.map((reserva) => (
                    <FormularioResultado key={reserva.id} reserva={reserva} alGuardar={recargar} />
                  ))}
                </div>
              </section>
            )}

            {/* RESERVAS CANCELADAS */}
            {canceladas.length > 0 && (
              <details className="mt-16 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer list-none px-6 py-5 font-display text-xl font-black text-[#071426] transition hover:text-emerald-700">
                  Reservas Canceladas ({canceladas.length})
                </summary>
                <div className="border-t border-slate-100">
                  {canceladas.map((reserva) => (
                    <p key={reserva.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
                      <span>
                        {reserva.cancha?.nombre} · {fechaCorta(reserva.fecha)} {reserva.hora_inicio.slice(0, 5)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-rose-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                        Cancelada
                      </span>
                    </p>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </main>
    </div>
  )
}
