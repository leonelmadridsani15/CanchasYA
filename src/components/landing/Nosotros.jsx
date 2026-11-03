
import { whatsappLink } from '../../lib/constants'

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
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[340px] rotate-2 rounded-[3rem] border-[10px] border-[#071426] bg-[#10251F] p-4 shadow-2xl shadow-black/40">
              <div className="absolute left-1/2 top-2 h-5 w-28 -translate-x-1/2 rounded-full bg-[#071426]" />
              <div className="flex items-center justify-between px-2 pb-5 pt-2 text-xs font-bold text-emerald-100">
                <span>CanchaYa</span>
                <span>♡</span>
              </div>
              <p className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Reserva por WhatsApp</p>
              <div className="mt-5 space-y-4">
                <div className="mr-8 rounded-3xl rounded-tl-md bg-[#29443C] px-4 py-3 text-sm leading-5 text-white">
                  ¡Hola! 👋 Quiero reservar una cancha para este fin de semana.
                </div>
                <div className="ml-8 rounded-3xl rounded-tr-md bg-[#CDE8B9] px-4 py-3 text-sm font-semibold leading-5 text-[#163A2B]">
                  ¡Hola! ⚽ Claro, te ayudamos. ¿Qué día y horario necesitas?
                </div>
                <div className="mr-8 rounded-3xl rounded-tl-md bg-[#29443C] px-4 py-3 text-sm leading-5 text-white">
                  Sábado a las 19:00, para fútbol 7.
                </div>
                <div className="ml-8 rounded-3xl rounded-tr-md bg-[#CDE8B9] px-4 py-3 text-sm font-semibold leading-5 text-[#163A2B]">
                  Perfecto. Revisaremos la disponibilidad y confirmaremos tu reserva.
                </div>
              </div>
              <a href={whatsappLink('Hola, quiero reservar una cancha.')} target="_blank" rel="noopener" className="mt-8 flex items-center justify-between rounded-full border border-emerald-200/50 px-4 py-3 text-xs text-emerald-100 transition hover:bg-emerald-400/10">
                <span>Escribe tu mensaje…</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#CDE8B9] text-lg font-black text-[#163A2B]">→</span>
              </a>
              <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-emerald-100/40" />
            </div>
          </div>
        </div> 
      </div> 
    </section> 
  ) 
}
