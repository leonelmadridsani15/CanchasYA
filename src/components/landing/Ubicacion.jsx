import { Clock3, MapPin } from 'lucide-react'

export default function Ubicacion() {
  return (
    <section id="ubicacion" className="bg-[#FAF9F6] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px] p-2 sm:p-4 lg:p-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Información (40%) */}
          <div className="flex flex-col justify-center lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#16A34A]">Ven a visitarnos</span>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-[#071426] sm:text-5xl">
              Encontrá tu próximo partido
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
              Ven a conocer nuestras instalaciones, reúne a tu equipo y disfruta de una experiencia deportiva pensada para compartir y jugar.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4 rounded-2xl border border-[#071426]/10 bg-white p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700" aria-hidden="true">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Dónde encontrarnos</p>
                  <p className="mt-1 font-bold text-[#071426]">Dirección del complejo deportivo</p>
                  <p className="text-sm text-slate-500">Santiago, Chile</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-2xl border border-[#071426]/10 bg-white p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700" aria-hidden="true">
                  <Clock3 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Horarios de atención</p>
                  <p className="mt-1 font-bold text-[#071426]">Lunes a Domingo</p>
                  <p className="text-sm text-slate-500">09:00 — 00:00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa (60%) */}
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-emerald-200 bg-[#0B1B33] shadow-lg lg:col-span-3 lg:min-h-[460px]">
            <iframe
              title="Mapa de ubicación de CanchaYa"
              src="https://maps.google.com/maps?q=Santiago%2C%20Chile&z=13&output=embed"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(0.9)' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}
