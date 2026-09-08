
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
              En CanchaYa hacemos que organizar un partido sea más fácil. Encuentra una cancha, elige el horario que más te acomode y reserva en pocos pasos, todo desde un solo lugar. Menos tiempo buscando y más tiempo jugando. 
            </p> 
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4"> 
              <div> 
                <p className="font-display text-3xl font-black text-lime-400">100%</p> 
                <p className="mt-1 text-xs font-bold text-slate-400">Pasión por el fútbol</p> 
              </div> 
              <div> 
                <p className="font-display text-3xl font-black text-white">24/7</p> 
                <p className="mt-1 text-xs font-bold text-slate-400">Plataforma online</p> 
              </div> 
              <div> 
                <p className="font-display text-3xl font-black text-emerald-400">3</p> 
                <p className="mt-1 text-xs font-bold text-slate-400">Pasos para reservar</p> 
              </div> 
              <div> 
                <p className="font-display text-3xl font-black text-white">6</p> 
                <p className="mt-1 text-xs font-bold text-slate-400">Canchas disponibles</p> 
              </div> 
            </div> 
          </div> 
          <div className="grid grid-cols-2 gap-4"> 
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6"> 
              <h3 className="text-base font-black">⚽ Pasión por el fútbol</h3> 
              <p className="mt-2 text-xs leading-5 text-slate-400">Creamos CanchaYa pensando en quienes disfrutan reunirse, competir y compartir un buen partido.</p> 
            </div> 
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6"> 
              <h3 className="text-base font-black">⚡ Reserva fácil</h3> 
              <p className="mt-2 text-xs leading-5 text-slate-300">Encuentra tu cancha, elige el horario que prefieras y confirma tu reserva de forma sencilla.</p> 
            </div> 
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6"> 
              <h3 className="text-base font-black">📅 Todo en un solo lugar</h3> 
              <p className="mt-2 text-xs leading-5 text-slate-300">Consulta las canchas disponibles y organiza tu próximo partido sin tener que buscar en distintos lugares.</p> 
            </div> 
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6"> 
              <h3 className="text-base font-black">🤝 Pensado para equipos</h3> 
              <p className="mt-2 text-xs leading-5 text-slate-400">Una experiencia simple para que tú y tu equipo puedan preocuparse menos por organizar y disfrutar más del partido.</p> 
            </div> 
          </div> 
        </div> 
      </div> 
    </section> 
  ) 
}
