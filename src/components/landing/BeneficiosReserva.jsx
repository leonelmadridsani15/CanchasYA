import { CalendarCheck2, Clock3, MapPinned, ShieldCheck } from 'lucide-react'

const beneficios = [
  {
    icono: MapPinned,
    titulo: 'Encuentra la cancha ideal',
    descripcion: 'Conoce nuestras canchas, superficies e instalaciones antes de elegir.',
  },
  {
    icono: Clock3,
    titulo: 'Elige un horario disponible',
    descripcion: 'Revisa los turnos libres y reserva el momento que mejor le acomode a tu equipo.',
  },
  {
    icono: CalendarCheck2,
    titulo: 'Reserva en pocos pasos',
    descripcion: 'Selecciona el día, agrega servicios y confirma tu próximo partido fácilmente.',
  },
  {
    icono: ShieldCheck,
    titulo: 'Juega con tranquilidad',
    descripcion: 'Recibe el detalle de tu reserva y mantén todo organizado desde tu cuenta.',
  },
]

export default function BeneficiosReserva() {
  return (
    <section className="relative z-10 -mt-8 bg-[#FAF9F6] px-4 pb-2 lg:-mt-12 lg:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-0 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-xl shadow-[#071426]/10 sm:grid-cols-2 lg:grid-cols-4">
        {beneficios.map(({ icono: Icono, titulo, descripcion }, index) => (
          <article
            key={titulo}
            className={`p-6 text-center sm:p-7 lg:p-8 ${index > 0 ? 'border-t border-emerald-100 sm:border-l lg:border-t-0' : ''}`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF7E3] text-emerald-700">
              <Icono size={27} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-base font-black leading-snug text-[#071426]">{titulo}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{descripcion}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
