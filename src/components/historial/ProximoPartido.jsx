import { ESTADOS_RESERVA, FORMATOS, fechaCorta, money } from '../../lib/constants'

export default function ProximoPartido({ reserva }) {
  const cancha = reserva.cancha ?? {}
  const total = 0 // el saldo se calcula con el precio de la cancha
  const precio = Number(cancha.precio_por_hora ?? 0)
  const sena = precio / 2
  const saldo = precio - sena

  const mensaje = `¡Turno confirmado! ⚽ Cancha: ${cancha.nombre} | Fecha: ${fechaCorta(reserva.fecha)} ${reserva.hora_inicio.slice(0, 5)} | Saldo: ${money(saldo)}`

  return (
    <article className="relative overflow-hidden rounded-2xl border border-emerald-900/50 bg-emerald-950 p-6 text-white shadow-lg transition-all hover:border-emerald-600/60 hover:shadow-2xl hover:shadow-emerald-600/20">
      {/* Línea decorativa superior estilo ticket */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300/60 to-transparent"></div>

      {/* Cabecera: fecha + badge de estado */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-900/60 px-3 py-1 text-xs font-bold text-emerald-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {fechaCorta(reserva.fecha)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/60 px-3 py-1 text-xs font-bold text-emerald-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600"></span>
          {ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}
        </span>
      </div>

      {/* Título principal: formato + hora grande */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold text-white">{cancha.nombre}</h3>
          <p className="mt-1 text-sm font-bold text-emerald-600">
            {FORMATOS[cancha.formato_juego] ?? cancha.formato_juego}
            <span className="mx-1 text-slate-500">•</span>
            <span className="font-semibold text-slate-500">{ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-600" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span className="font-display text-3xl font-extrabold tracking-tight text-white">
            {reserva.hora_inicio.slice(0, 5)}
          </span>
        </div>
      </div>

      {/* Caja de pago: seña + saldo pendiente */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-900/40 p-4 ring-1 ring-inset ring-emerald-300/20">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/80">Seña Pagada</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-600">{money(sena)}</p>
        </div>
        <div className="rounded-xl bg-amber-400/10 p-4 ring-1 ring-inset ring-amber-400/20">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300/80">Saldo Pendiente en Cancha</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-300">{money(saldo || total)}</p>
        </div>
      </div>

      {/* Botón principal */}
      <a
        href={'https://wa.me/?text=' + encodeURIComponent(mensaje)}
        target="_blank"
        rel="noopener"
        className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
          <path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.08 24l6.28-1.65a11.88 11.88 0 0 0 5.72 1.46h.01c6.55 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.47-8.43Zm-8.44 18.29h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.86 9.86 0 0 1-1.51-5.25c0-5.44 4.43-9.86 9.87-9.86a9.8 9.8 0 0 1 6.98 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.44-4.43 9.86-9.87 9.86Zm5.41-7.39c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
        </svg>
        Ver Comprobante / Enviar a WhatsApp
      </a>
    </article>
  )
}
