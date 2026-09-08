
export default function ComoFunciona() {
  const pasos = [
    {
      numero: '01',
      titulo: 'Inicia sesión o crea tu cuenta',
      descripcion:
        'Regístrate en pocos segundos y guarda tus datos para que tus próximas reservas sean aún más rápidas.',
      badge: 'Datos guardados',
    },
    {
      numero: '02',
      titulo: 'Elige la cancha y el horario',
      descripcion:
        'Selecciona la cancha, el día y el horario que mejor se adapten a tu equipo. También podrás agregar servicios adicionales si están disponibles.',
      badge: 'Personalizable',
    },
    {
      numero: '03',
      titulo: 'Confirma y a jugar',
      descripcion:
        'Revisa los detalles de tu reserva, confirma y listo. Tu próximo partido estará agendado de forma rápida y sencilla.',
      badge: 'Reserva rápida',
    },
  ]

  return (
    <section id="como-funciona" className="relative overflow-hidden bg-[#F1F5F4] py-20 lg:py-28">
      {/* Luces decorativas de fondo */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#16A34A]">
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
            Sin complicaciones
          </span>
          <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#071426] sm:text-5xl">
            Reserva en <span className="text-[#16A34A]">3 simples pasos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            Organiza tu próximo partido de forma rápida y sencilla desde un solo lugar.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {pasos.map((paso) => (
            <div
              key={paso.numero}
              className="group relative flex flex-col justify-between rounded-3xl border border-[#071426]/10 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/10"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-5xl font-black text-slate-200 transition-colors duration-300 group-hover:text-[#16A34A]">
                    {paso.numero}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 group-hover:bg-emerald-50 group-hover:text-[#16A34A]">
                    {paso.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-extrabold tracking-tight text-[#071426]">
                  {paso.titulo}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {paso.descripcion}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-extrabold text-[#16A34A] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span>Paso {paso.numero} completado</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
