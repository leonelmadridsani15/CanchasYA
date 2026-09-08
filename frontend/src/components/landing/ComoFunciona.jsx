export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-[#F1F5F4] py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#16A34A]">Sin complicaciones</span>
          <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-[#071426] sm:text-5xl">
            Reservá en 3 pasos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
            Todo lo que necesitás para organizar tu partido desde un solo lugar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              numero: '01',
              titulo: 'Elegí tu cancha',
              descripcion: 'Revisá nuestras canchas y seleccioná la que más se adapte a tu partido.',
            },
            {
              numero: '02',
              titulo: 'Escogé tu horario',
              descripcion: 'Seleccioná el día y la hora que mejor funcione para tu equipo.',
            },
            {
              numero: '03',
              titulo: 'Confirmá y jugá',
              descripcion: 'Confirmá tu reserva y preparate para disfrutar el partido.',
            },
          ].map((paso) => (
            <div
              key={paso.numero}
              className="rounded-3xl border border-[#071426]/10 bg-white p-8 transition hover:-translate-y-2 hover:border-emerald-200 hover:shadow-xl"
            >
              <span className="font-display text-5xl font-black text-emerald-100">{paso.numero}</span>
              <h3 className="mt-6 text-xl font-black text-[#071426]">{paso.titulo}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{paso.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
