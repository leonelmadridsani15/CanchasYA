export default function Nosotros() {
  return (
    <section id="nosotros" className="relative overflow-hidden bg-[#0B1B33] py-20 text-white lg:py-24">
      <div className="absolute -right-24 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true"></div>
      <div className="relative mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">Sobre CanchaYa</span>
            <h2 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
              Donde empieza <span className="text-emerald-400">el partido.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Creamos CanchaYa para que encontrar y reservar una cancha sea mucho más sencillo. Menos tiempo buscando
              y más tiempo jugando.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="font-display text-3xl font-black text-lime-400">100%</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Pasión por el fútbol</p>
              </div>
              <div>
                <p className="font-display text-3xl font-black text-white">24/7</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Reserva online</p>
              </div>
              <div>
                <p className="font-display text-3xl font-black text-emerald-400">30s</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Para reservar</p>
              </div>
              <div>
                <p className="font-display text-3xl font-black text-white">+500</p>
                <p className="mt-1 text-xs font-bold text-slate-400">Partidos jugados</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-black">🌱 Pasto profesional</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">Superficie certificada con amortiguación de alto impacto.</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h3 className="text-base font-black">⚡ Reserva inmediata</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">Agendá tu cancha en segundos con confirmación al instante.</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h3 className="text-base font-black">💡 Iluminación LED</h3>
              <p className="mt-2 text-xs leading-5 text-slate-300">Focos de última generación para visibilidad nocturna.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-black">🛡️ Tercer tiempo</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">Camarines equipados y estacionamiento privado.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
