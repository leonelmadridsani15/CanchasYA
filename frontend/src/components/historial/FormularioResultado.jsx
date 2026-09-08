import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { TABLES, fechaCorta } from '../../lib/constants'

/** Formulario para cargar el resultado de un partido terminado (equivalente a ResultadoPartidoForm). */
export default function FormularioResultado({ reserva, alGuardar }) {
  const [form, setForm] = useState({
    equipo_a: '',
    equipo_b: '',
    goles_a: '',
    goles_b: '',
    mvp_partido: '',
    notas: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    const { error: insertError } = await supabase.from(TABLES.resultadoPartido).insert({
      reserva_id: reserva.id,
      equipo_a: form.equipo_a,
      equipo_b: form.equipo_b,
      goles_a: Number(form.goles_a),
      goles_b: Number(form.goles_b),
      mvp_partido: form.mvp_partido,
      notas: form.notas,
    })
    setGuardando(false)
    if (insertError) setError(insertError.message)
    else alGuardar?.()
  }

  const inputClases =
    'rounded-xl border border-emerald-900/50 bg-white p-3 text-sm text-slate-600 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-emerald-900/50 bg-emerald-950 p-6 text-white shadow-lg transition-all hover:border-emerald-400"
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-xl font-bold text-white">{reserva.cancha?.nombre}</p>
        <span className="rounded-lg bg-emerald-900/60 px-3 py-1 text-xs font-bold text-slate-500">
          {fechaCorta(reserva.fecha)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <input required placeholder="Equipo local" value={form.equipo_a} onChange={actualizar('equipo_a')} className={inputClases} />
        <input required placeholder="Equipo visitante" value={form.equipo_b} onChange={actualizar('equipo_b')} className={inputClases} />
        <input required type="number" min="0" placeholder="Goles local" value={form.goles_a} onChange={actualizar('goles_a')} className={inputClases} />
        <input required type="number" min="0" placeholder="Goles visitante" value={form.goles_b} onChange={actualizar('goles_b')} className={inputClases} />
        <input placeholder="MVP (opcional)" value={form.mvp_partido} onChange={actualizar('mvp_partido')} className={`${inputClases} col-span-2`} />
        <textarea rows="2" placeholder="Notas" value={form.notas} onChange={actualizar('notas')} className={`${inputClases} col-span-2`}></textarea>
      </div>

      {error && <p className="mt-3 text-sm font-bold text-rose-400">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="mt-5 w-full rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {guardando ? 'Guardando…' : 'Cargar Resultado'}
      </button>
    </form>
  )
}
