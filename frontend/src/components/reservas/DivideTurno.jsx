import { useEffect, useState } from 'react'
import { money } from '../../lib/constants'

/**
 * Calculadora "Divide el turno": seña y saldo por persona + compartir por WhatsApp.
 * Replica el script data-calculadora de reserva_confirmada.html / pago_resultado.html
 */
export default function DivideTurno({ total, pagado, reserva }) {
  const [jugadores, setJugadores] = useState(10)

  const saldo = total - pagado
  const mensaje = `¡Turno confirmado! ⚽ Cancha: ${reserva.cancha} | Fecha: ${reserva.fecha} ${reserva.hora} | Saldo pendiente por persona: ${money(saldo / jugadores)}`
  const whatsappHref = 'https://wa.me/?text=' + encodeURIComponent(mensaje)

  const botonClases = (valor) =>
    [
      'rounded-xl px-4 py-2 text-sm transition',
      valor === jugadores
        ? 'bg-emerald-600 font-extrabold text-white'
        : 'border border-emerald-900/60 font-bold text-slate-500',
    ].join(' ')

  return (
    <div className="mt-10 rounded-3xl border border-emerald-900/50 bg-emerald-950 p-6 text-left text-white shadow-lg sm:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Herramientas de grupo</p>
          <h2 className="mt-1 font-display text-2xl font-bold">Divide el turno</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setJugadores(10)} className={botonClases(10)}>
            10 jugadores
          </button>
          <button type="button" onClick={() => setJugadores(12)} className={botonClases(12)}>
            12 jugadores
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-slate-900">
          <p className="text-xs font-semibold text-slate-500">Seña por persona</p>
          <p className="mt-1 font-display text-2xl font-black text-emerald-600">{money(pagado / jugadores)}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 text-slate-900">
          <p className="text-xs font-semibold text-slate-500">Saldo restante por persona</p>
          <p className="mt-1 font-display text-2xl font-black text-emerald-600">{money(saldo / jugadores)}</p>
        </div>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener"
        className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3.5 font-extrabold text-white transition hover:bg-emerald-700"
      >
        Compartir Reserva por WhatsApp <span className="ml-2">↗</span>
      </a>
    </div>
  )
}
