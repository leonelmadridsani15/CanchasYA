import Navbar from '../components/landing/Navbar'

export default function Terminos() {
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
              Términos y Condiciones
            </h1>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Términos y condiciones aplicables a las reservas realizadas a través de CanchaYa
            </p>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-600">
              {/* SECCIÓN 1 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">1. Reservas, Disponibilidad y Horarios</h2>
                <p className="mt-2">
                  Toda reserva realizada a través de CanchaYa garantiza el uso exclusivo del espacio o cancha seleccionada durante el bloque horario agendado.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1 pl-2">
                  <li>Se recomienda a los usuarios e integrantes de cada equipo llegar <strong>15 minutos antes</strong> del inicio de su turno.</li>
                  <li>La reserva queda oficialmente garantizada una vez efectuada la confirmación y validación del turno.</li>
                </ul>
              </section>

              {/* SECCIÓN 2 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">2. Tarifas y Medios de Pago</h2>
                <p className="mt-2">
                  Los valores exhibidos están expresados en pesos chilenos (CLP). El pago o abono del turno se coordina según los canales oficiales habilitados. La plataforma CanchaYa no almacena ni solicita datos bancarios directos dentro del sitio.
                </p>
              </section>

              {/* SECCIÓN 3 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">3. Cancelaciones y Reagendamiento</h2>
                <p className="mt-2">
                  Las cancelaciones o reprogramaciones de turnos deben solicitarse con al menos <strong>24 horas de anticipación</strong> a través de nuestros canales de contacto o WhatsApp para optar a la reagendación del turno. En caso de condiciones climáticas adversas (como lluvia) o imprevistos técnicos del recinto, la fecha podrá ser reprogramada de común acuerdo.
                </p>
              </section>

              {/* SECCIÓN 4 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">4. Uso de Instalaciones y Normas de Convivencia</h2>
                <p className="mt-2">
                  Es responsabilidad de todos los usuarios cuidar la infraestructura del recinto (canchas, iluminación, camarines, zonas comunes y quinchos) y respetar el reglamento interno:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1.5 pl-2">
                  <li className="font-bold text-red-600">
                    Está estrictamente prohibido el consumo de bebidas alcohólicas, drogas o cualquier sustancia ilícita dentro del recinto e instalaciones.
                  </li>
                  <li>Está prohibido el ingreso con calzado no adecuado (como toperoles de fierro o choperas rígidas en pasto sintético).</li>
                  <li>Queda prohibido ingresar al área de juego con botellas de vidrio, objetos cortopunzantes o elementos que pongan en riesgo la integridad física de los deportistas.</li>
                  <li>Cualquier daño intencional a la infraestructura deberá ser cubierto por el titular de la reserva.</li>
                </ul>
              </section>

              {/* SECCIÓN 5 */}
              <section>
                <h2 className="text-lg font-bold text-[#166534]">5. Contacto y Soporte</h2>
                <p className="mt-2">
                  Para consultas referente a tus reservas en CanchaYa, puedes escribirnos a{' '}
                  <a href="mailto:leonelmadridsa@gmail.com" className="font-bold text-[#166534] hover:underline">
                    leonelmadridsa@gmail.com
                  </a>{' '}
                  o comunicarte a través de nuestra{' '}
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