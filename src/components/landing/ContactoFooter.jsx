import { whatsappLink } from '../../lib/constants'

export default function ContactoFooter() {
  return (
    <>
      {/* CONTACTO */}
      <section
        id="contacto"
        className="border-t border-slate-200 bg-white py-16 text-[#071426] lg:py-20"
      >
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-[#16A34A]">
                Estamos para ayudarte
              </span>

              <h2 className="mt-3 font-display text-3xl font-black sm:text-4xl">
                Contáctanos
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                ¿Tienes alguna consulta sobre reservas, horarios o canchas?
                Escríbenos y estaremos encantados de ayudarte.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-1 hover:bg-emerald-100"
              >
                <span className="text-2xl" aria-hidden="true">
                  💬
                </span>

                <p className="mt-3 text-base font-black text-[#071426]">
                  WhatsApp
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Consulta y reserva directamente con nosotros.
                </p>
              </a>

              <a
                href="/login"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-slate-100"
              >
                <span className="text-2xl" aria-hidden="true">
                  👤
                </span>

                <p className="mt-3 text-base font-black text-[#071426]">
                  Tu cuenta
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Inicia sesión para revisar tus reservas e historial.
                </p>
              </a>
            </div>
          </div>

          {/* Correo */}
          <div className="mt-10 border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-500">
              ¿Prefieres escribirnos por correo?
              <a
                href="mailto:leonelmadridsa@gmail.com"
                className="ml-1 font-semibold text-[#16A34A] transition hover:text-[#15803D]"
              >
                leonelmadridsa@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* COMUNIDAD */}
      <section className="bg-white py-12 lg:py-16">
        <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-[#123D28] px-8 py-10 text-white shadow-xl md:px-12 md:py-12">
            
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-lime-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-lime-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
                  Comunidad CanchaYa
                </span>

                <h2 className="mt-4 font-display text-3xl font-black sm:text-4xl">
                  Únete a nuestra comunidad
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-200 sm:text-base">
                  Recibe novedades, promociones y noticias de CanchaYa.
                  Únete a nuestra comunidad de WhatsApp y mantente al día
                  con todo lo que tenemos para ti.
                </p>
              </div>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-lime-400 px-6 py-4 text-sm font-black text-[#071426] shadow-lg transition hover:-translate-y-1 hover:bg-lime-300"
              >
                <span className="text-xl" aria-hidden="true">
                  💬
                </span>
                Unirme a WhatsApp
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white text-[#071426]">
        <div className="mx-auto max-w-[1280px] px-4 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            
            {/* Marca */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#16A34A] text-lg text-white"
                  aria-hidden="true"
                >
                  ⚽
                </div>

                <span className="font-display text-2xl font-black">
                  CANCHA<span className="text-[#16A34A]">YA</span>
                </span>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                Tu cancha. Tu partido. Tu momento.
              </p>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-[#071426] transition hover:bg-slate-100"
              >
                💬 Escríbenos por WhatsApp
              </a>
            </div>

            {/* Navegación */}
            <div>
              <h3 className="text-sm font-black">Navegación</h3>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <a href="#inicio" className="block transition hover:text-[#16A34A]">
                  Inicio
                </a>
                <a href="#canchas" className="block transition hover:text-[#16A34A]">
                  Canchas
                </a>
                <a href="#instalaciones" className="block transition hover:text-[#16A34A]">
                  Instalaciones
                </a>
                <a href="#nosotros" className="block transition hover:text-[#16A34A]">
                  Nosotros
                </a>
              </div>
            </div>

            {/* Información */}
            <div>
              <h3 className="text-sm font-black">Información</h3>

              <div className="mt-4 space-y-3 text-sm text-slate-500">
                <a href="#ubicacion" className="block transition hover:text-[#16A34A]">
                  Ubicación
                </a>
                <a href="#contacto" className="block transition hover:text-[#16A34A]">
                  Contacto
                </a>
                <a href="/terminos" className="block transition hover:text-[#16A34A]">
                  Términos y condiciones
                </a>
                <a href="/privacidad" className="block transition hover:text-[#16A34A]">
                  Política de privacidad
                </a>
              </div>
            </div>
          </div>

          {/* Línea inferior mejorada */}
          <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p>© 2026 CanchaYa. Todos los derechos reservados.</p>
              <p className="flex items-center gap-1.5 font-medium text-slate-600">
                Desarrollado por:
                <a
                  href="mailto:leonelmadridsa@gmail.com"
                  className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-[#16A34A] border border-emerald-200/60 transition hover:bg-emerald-100"
                >
                  leonelmadridsa@gmail.com
                </a>
              </p>
            </div>

            <p className="font-medium text-slate-600">
              Hecho para quienes viven el fútbol. ⚽
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}