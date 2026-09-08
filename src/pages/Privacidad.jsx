import Navbar from '../components/landing/Navbar'

export default function Privacidad() {
  const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/C8lFeDQh11N6uRmCJEVL5G"

  return (
    /* Fondo ultra suave y claro (#FAF9F6) */
    <div className="min-h-screen bg-[#FAF9F6] text-[#071426]">
      <Navbar />

      <main className="py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          {/* Tarjeta en blanco puro */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm lg:p-12">
            
            {/* Título en verde oscuro */}
            <h1 className="font-display text-3xl font-black text-[#166534] sm:text-4xl">
              Política de Privacidad
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Política de privacidad y protección de datos para las reservas en CanchaYa
            </p>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
              {/* SECCIÓN 1 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">1. Datos que Recopilamos</h2>
                <p className="mt-2">
                  Recopilamos únicamente los datos básicos y necesarios para procesar tus reservas en CanchaYa y brindarte una mejor atención:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 pl-2">
                  <li>Nombre y apellidos del titular de la reserva.</li>
                  <li>Teléfono de contacto / WhatsApp.</li>
                  <li>Correo electrónico.</li>
                </ul>
              </section>

              {/* SECCIÓN 2 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">2. Uso de la Información</h2>
                <p className="mt-2">
                  Tus datos son utilizados exclusivamente para confirmar tu horario de reserva, comunicarte cambios sobre el recinto o enviarte información relevante sobre promociones mediante nuestra comunidad.
                </p>
              </section>

              {/* SECCIÓN 3 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">3. Normas del Recinto y Protección de Datos</h2>
                <p className="mt-2">
                  Garantizamos la confidencialidad de tu información personal y velamos por el cumplimiento de las normas del recinto:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1.5 pl-2">
                  <li className="font-bold text-red-600">
                    Está strictly prohibido el consumo de bebidas alcohólicas, drogas o sustancias ilícitas dentro de las instalaciones.
                  </li>
                  <li>Tu información personal no será compartida ni vendida a terceros bajo ninguna circunstancia.</li>
                </ul>
              </section>

              {/* SECCIÓN 4 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">4. Consultas y Derechos</h2>
                <p className="mt-2">
                  Si deseas modificar o eliminar la información guardada en nuestro sistema de reservas de CanchaYa, escríbenos directamente a{' '}
                  <a href="mailto:leonelmadridsa@gmail.com" className="font-bold text-[#166534] hover:underline">
                    leonelmadridsa@gmail.com
                  </a>{' '}
                  o contáctanos mediante nuestra{' '}
                  <a
                    href={WHATSAPP_COMMUNITY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#166534] hover:underline"
                  >
                    Comunidad de WhatsApp
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}