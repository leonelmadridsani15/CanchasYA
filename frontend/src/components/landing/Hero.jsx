export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[520px] items-center overflow-hidden bg-[#071426] text-white lg:min-h-[560px]"
    >
      {/* Imagen de fondo */}
      <img
        src="https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=2200&q=90"
        alt="Cancha de fútbol"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />

      {/* Oscurecimiento general */}
      <div className="absolute inset-0 bg-[#071426]/40"></div>

      {/* Degradado para mejorar lectura */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#071426]/65 to-[#071426]/10"></div>

      {/* Degradado inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/70 via-transparent to-transparent"></div>

      {/* CONTENIDO */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          {/* Etiqueta */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-400/10 px-4 py-1.5 backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-300 sm:text-[11px]">
              Agenda abierta · Turnos hoy
            </span>
          </div>

          {/* TÍTULO */}
          <h1 className="font-display text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Tú pones los cracks,
            <span className="mt-2 block">
              nosotros la <span className="text-lime-400"> cancha.</span>
            </span>
          </h1>

          {/* DESCRIPCIÓN */}
          <p className="mt-6 max-w-xl text-sm leading-6 text-slate-200 sm:text-base lg:text-lg">
            Encuentra tu cancha, reúne a tu equipo y disfruta del partido. Reserva de forma sencilla y vive la
            experiencia CanchaYa.
          </p>

          {/* BOTÓN */}
          <div className="mt-7">
            <a
              href="#canchas"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#16A34A] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/40 transition-all duration-300 hover:-translate-y-1 hover:bg-lime-400 hover:text-[#071426]"
            >
              Explorar canchas
              <span className="text-lg">→</span>
            </a>
          </div>

          {/* CARACTERÍSTICAS */}
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {['Pasto sintético', 'Iluminación LED', 'Instalaciones equipadas'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-200 sm:text-sm">
                <span className="text-lime-400">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
