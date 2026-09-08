import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, ESTADOS_RESERVA, FORMATOS, fechaCorta, money } from '../lib/constants'
import ProximoPartido from '../components/historial/ProximoPartido'
import PartidoPasado from '../components/historial/PartidoPasado'
import FormularioResultado from '../components/historial/FormularioResultado'

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
      <div className="min-h-screen bg-white text-slate-900">
        <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
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
    <div className="min-h-screen bg-white text-slate-900">
      <main className="mx-auto max-w-7xl px-5 pb-24 pt-32 lg:px-8">
        {/* Cabecera / Perfil del Jugador */}
        <section className="border-b border-emerald-900/50 pb-10">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2v20M2 12h20" />
            </svg>
            Match Pass
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">{user.email}</h1>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-900/60 px-4 py-1.5 text-xs font-bold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-600 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
            </span>
            Jugador Amateur ⚽
          </span>
        </section>

        {cargando ? (
          <p className="mt-10 text-center text-sm font-bold text-slate-500">Cargando perfil…</p>
        ) : error ? (
          <div className="mt-10 rounded-2xl border border-rose-300 bg-rose-100/60 p-6 text-sm font-bold text-rose-700">{error}</div>
        ) : (
          <>
            {/* KPIs / Estadísticas superiores */}
            <section className="mt-10">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {kpis.map((kpi) => (
                  <div key={kpi.valor + kpi.etiqueta.join()} className="rounded-2xl border border-emerald-900/50 bg-emerald-950 p-4 text-white shadow-lg transition-all hover:border-emerald-400">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-900/60 text-slate-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 7l4.76 3.45-1.82 5.6H9.06l-1.82-5.6L12 7z" />
                        </svg>
                      </div>
                      <p className="text-xs font-bold text-slate-500">
                        {kpi.etiqueta[0]}
                        <br />
                        {kpi.etiqueta[1]}
                      </p>
                    </div>
                    <p className="mt-3 font-display text-4xl font-bold text-white">{kpi.valor}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PRÓXIMOS PARTIDOS */}
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold tracking-tight">Próximos Partidos</h2>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {proximos.length === 0 ? (
                  <p className="col-span-full rounded-2xl border border-dashed border-emerald-900/50 bg-emerald-950/40 p-8 text-center text-sm text-slate-500">
                    No tenés próximos partidos confirmados. ¡Reservá tu turno! 🏟️
                  </p>
                ) : (
                  proximos.map((reserva) => <ProximoPartido key={reserva.id} reserva={reserva} />)
                )}
              </div>
            </section>

            {/* PARTIDOS PASADOS · Marcador Deportivo de TV */}
            <section className="mt-16">
              <h2 className="font-display text-3xl font-bold tracking-tight">Partidos Pasados</h2>
              <div className="mt-6 space-y-6">
                {partidos.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-emerald-900/50 bg-emerald-950/40 p-8 text-center text-sm text-slate-500">
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
                <h2 className="font-display text-3xl font-bold tracking-tight">Cargar Resultado</h2>
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
              <details className="mt-16 overflow-hidden rounded-2xl border border-emerald-900/50 bg-emerald-950 text-white">
                <summary className="cursor-pointer list-none px-6 py-4 font-display text-xl font-bold text-white transition hover:text-emerald-600">
                  Reservas Canceladas ({canceladas.length})
                </summary>
                <div className="border-t border-emerald-900/50">
                  {canceladas.map((reserva) => (
                    <p key={reserva.id} className="flex items-center justify-between gap-3 border-b border-emerald-900/50 px-6 py-3 text-sm text-slate-500">
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
