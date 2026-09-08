import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { TABLES, FORMATOS, SUPERFICIES, IMAGENES_CANCHA } from '../../lib/constants'

export default function CanchasSection() {
  const { user } = useAuth()
  const [canchas, setCanchas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargarCanchas() {
      const { data, error } = await supabase
        .from(TABLES.cancha)
        .select('*')
        .eq('activa', true)
        .order('id', { ascending: true })

      if (error) setError(error.message)
      else setCanchas(data ?? [])
      setCargando(false)
    }
    cargarCanchas()
  }, [])

  return (
    <section id="canchas" className="relative overflow-hidden bg-[#faf6f0] py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"></div>
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"></div>

      <div className="relative mx-auto max-w-[1280px] px-4 lg:px-8">
        {/* ENCABEZADO */}
        <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-emerald-800">Elige tu cancha</span>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Canchas disponibles
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Encuentra el espacio perfecto para tu equipo y reserva tu próximo partido.
            </p>
          </div>
          <div className="w-fit rounded-full border border-stone-300 bg-stone-200/60 px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-bold text-slate-800">{canchas.length} canchas disponibles</span>
          </div>
        </div>

        {/* TARJETAS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cargando ? (
            <div className="col-span-full rounded-3xl border border-dashed border-stone-300 bg-stone-200/50 p-16 text-center">
              <p className="text-sm font-bold text-slate-500">Cargando canchas…</p>
            </div>
          ) : error ? (
            <div className="col-span-full rounded-3xl border border-rose-300 bg-rose-100/60 p-16 text-center">
              <h3 className="text-xl font-black text-rose-900">Error al cargar canchas</h3>
              <p className="mt-2 text-sm text-rose-700">{error}</p>
            </div>
          ) : canchas.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-stone-300 bg-stone-200/50 p-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-800/10 text-3xl">
                ⚽
              </div>
              <h3 className="mt-5 text-xl font-black text-slate-900">No hay canchas disponibles</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                En este momento no tenemos canchas disponibles para mostrar.
              </p>
            </div>
          ) : (
            canchas.map((cancha, index) => (
              <TarjetaCancha key={cancha.id} cancha={cancha} index={index} autenticado={Boolean(user)} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function TarjetaCancha({ cancha, index, autenticado }) {
  const formato = FORMATOS[cancha.formato_juego] ?? cancha.formato_juego

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0B1B33] text-white shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/30 hover:shadow-emerald-950/30">
      {/* IMAGEN / CABECERA */}
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-600 to-lime-400">
        <img
          src={IMAGENES_CANCHA[index % IMAGENES_CANCHA.length]}
          alt={`Cancha ${cancha.nombre}`}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/80 via-transparent to-transparent"></div>

        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#071426]/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
          {formato}
        </span>
        <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[#071426]/85 px-3 py-1.5 text-[10px] font-black text-lime-300 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400"></span>
          Disponible
        </span>
      </div>

      {/* INFORMACIÓN */}
      <div className="p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
          {SUPERFICIES[cancha.tipo_superficie] ?? cancha.tipo_superficie}
        </p>
        <h3 className="mt-2 font-display text-2xl font-black text-white">{cancha.nombre}</h3>
        <p className="mt-1 text-sm text-slate-400">Pasto {cancha.tipo_pasto}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300">
            ⚽ {formato}
          </span>
          {cancha.iluminacion_led && (
            <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300">
              💡 Iluminación
            </span>
          )}
        </div>

        {/* PRECIO */}
        <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Desde</p>
            <p className="mt-1 font-display text-2xl font-black text-white">
              ${Number(cancha.precio_por_hora).toFixed(0)}
            </p>
            <p className="text-xs text-slate-500">por hora</p>
          </div>
        </div>
      </div>

      {/* BOTÓN */}
      <div className="px-6 pb-6">
        <Link
          to={autenticado ? `/reservar/${cancha.id}` : '/login'}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#16A34A] py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:bg-lime-400 hover:text-[#071426]"
        >
          {autenticado ? 'Reservar cancha' : 'Iniciar sesión para reservar'}
          <span className="text-lg">→</span>
        </Link>
      </div>
    </article>
  )
}
