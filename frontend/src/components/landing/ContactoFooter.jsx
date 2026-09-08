import { whatsappLink } from '../../lib/constants'

export default function ContactoFooter() {
  return (
    <>
      {/* CONTACTO (compacto) */}
      <section id="contacto" className="border-t border-white/10 bg-[#0B1B33] py-16 text-white lg:py-20">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">Resolvemos tu consulta</span>
              <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">Contactanos</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
                Escribinos para reservas, consultas sobre turnos, precios o coordinar grupos.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener"
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 transition hover:bg-emerald-500/20"
              >
                <span className="text-2xl" aria-hidden="true">
                  💬
                </span>
                <p className="mt-3 text-base font-black">WhatsApp</p>
                <p className="mt-1 text-xs text-slate-300">Reservas y consultas al instante.</p>
              </a>
              <a
                href="/login"
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
              >
                <span className="text-2xl" aria-hidden="true">
                  👤
                </span>
                <p className="mt-3 text-base font-black">Tu cuenta</p>
                <p className="mt-1 text-xs text-slate-300">Ingresá para ver tus reservas e historial.</p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#050E1C] text-white">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-lg" aria-hidden="true">
                  ⚽
                </div>
                <span className="font-display text-2xl font-black">
                  CANCHA<span className="text-lime-400">YA</span>
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">Tu cancha. Tu partido. Tu momento.</p>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Escribinos por WhatsApp
              </a>
            </div>

            <div>
              <h3 className="text-sm font-black">Navegación</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <a href="#inicio" className="block transition hover:text-lime-400">Inicio</a>
                <a href="#canchas" className="block transition hover:text-lime-400">Canchas</a>
                <a href="#instalaciones" className="block transition hover:text-lime-400">Instalaciones</a>
                <a href="#nosotros" className="block transition hover:text-lime-400">Nosotros</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black">Información</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <a href="#ubicacion" className="block transition hover:text-lime-400">Ubicación</a>
                <a href="#contacto" className="block transition hover:text-lime-400">Contacto</a>
                <a href={whatsappLink()} target="_blank" rel="noopener" className="block transition hover:text-lime-400">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CanchaYa. Todos los derechos reservados.</p>
            <p>Hecho para los que viven el fútbol ⚽</p>
          </div>
        </div>
      </footer>
    </>
  )
}
