
import { useEffect, useState } from 'react'

function Carrusel({ nombre, imagenes, etiqueta, titulo, grande = false }) {
  const [indice, setIndice] = useState(0)

  const mover = (direccion) => {
    setIndice((actual) => (actual + direccion + imagenes.length) % imagenes.length)
  }

  useEffect(() => {
    const timer = setInterval(() => setIndice((a) => (a + 1) % imagenes.length), 4000)
    return () => clearInterval(timer)
  }, [imagenes.length])

  const posicionBotones = grande ? 'left-4 right-4 p-3' : 'left-3 right-3 p-2 text-xs'

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-emerald-500/20 shadow-2xl ${
        grande ? 'h-[420px] md:col-span-7 md:h-[500px]' : 'h-[240px]'
      }`}
    >
      {imagenes.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === indice ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt={`${etiqueta} ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      {/* Capa Sombra */}
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${
          grande ? 'from-[#071426]/90 via-[#071426]/30' : 'from-[#071426]/85'
        }`}
      />

      {/* Etiqueta y Título */}
      {grande ? (
        <div className="absolute bottom-0 left-0 p-8">
          <span className="rounded-full bg-lime-400 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#071426] shadow-lg shadow-lime-400/20">
            {etiqueta}
          </span>
          <h3 className="mt-3 text-2xl font-black text-white md:text-3xl">
            {titulo}
          </h3>
        </div>
      ) : (
        <span
          className={`absolute bottom-5 left-5 rounded-full px-4 py-1.5 text-xs font-black ${
            nombre === 'quinchos'
              ? 'bg-lime-400 text-[#071426]'
              : 'bg-white text-[#071426] shadow-md'
          }`}
        >
          {etiqueta}
        </span>
      )}

      {/* Botones de Navegación */}
      <button
        onClick={() => mover(-1)}
        aria-label="Anterior"
        className={`absolute ${posicionBotones.split(' ')[0]} top-1/2 -translate-y-1/2 rounded-full bg-black/50 ${
          posicionBotones.split(' ')[2]
        } text-white backdrop-blur-md transition hover:bg-lime-400 hover:text-black`}
      >
        ❮
      </button>

      <button
        onClick={() => mover(1)}
        aria-label="Siguiente"
        className={`absolute ${posicionBotones.split(' ')[1]} top-1/2 -translate-y-1/2 rounded-full bg-black/50 ${
          posicionBotones.split(' ')[2]
        } text-white backdrop-blur-md transition hover:bg-lime-400 hover:text-black`}
      >
        ❯
      </button>
    </div>
  )
}

const SERVICIOS = [
  {
    titulo: 'Iluminación LED',
    descripcion: 'Disfruta tus partidos de día o de noche con una cancha bien iluminada.',
    path: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7.5V18h6v-1.5c2-2 4-4.5 4-7.5a7 7 0 0 0-7-7z',
  },
  {
    titulo: 'Camarines Equipados',
    descripcion: 'Espacios cómodos para cambiarte y ducharte antes o después del partido.',
    path: 'M4 4h7a4 4 0 0 1 4 4v12M12 20h6M15 12h.01M18 12h.01M13.5 15h.01M16.5 15h.01M15 18h.01',
  },
  {
    titulo: 'Estacionamiento Privado',
    descripcion: 'Deja tu vehículo dentro del complejo y disfruta tu partido con tranquilidad.',
    path: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M5 17H3v-6l2-5h10l2 5v6h-2M9 17h6',
  },
  {
    titulo: 'Quinchos y Espacios Sociales',
    descripcion: 'Comparte con tu equipo antes o después del partido en un espacio pensado para disfrutar.',
    path: 'M6 3v7a3 3 0 0 0 6 0V3M9 3v7M12 3v7M18 3v18M16 8h4',
  },
]

export default function Instalaciones() {
  return (
    <section
      id="instalaciones"
      className="relative overflow-hidden bg-[#071426] py-20 text-white lg:py-28"
    >
      {/* Luces verdes de fondo más luminosas */}
      <div className="pointer-events-none absolute top-1/3 -left-20 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 -right-20 h-[600px] w-[600px] rounded-full bg-lime-400/20 blur-[150px]" />

      <div className="relative mx-auto max-w-[1280px] px-4 lg:px-8">
        {/* Encabezado */}
        <div className="mb-14 grid gap-4 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-[0.25em] text-lime-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-400" />
              Más que una cancha
            </span>

            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
              Nuestras <span className="text-emerald-400">instalaciones</span>
            </h2>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-slate-300 lg:ml-auto">
            Todo lo que necesitas para disfrutar tu partido antes, durante y después del juego.
          </p>
        </div>

        {/* Rejilla de Carruseles */}
        <div className="grid gap-6 md:grid-cols-12">
          <Carrusel
            nombre="canchas"
            grande
            etiqueta="Canchas y Campos"
            titulo="Pasto Sintético e Iluminación LED"
            imagenes={[
              '/img/canchas_1.jpg',
              '/img/canchas_2.jpg',
              '/img/canchas_3.jpg',
              '/img/canchas_4.jpg',
              '/img/canchas_5.jpg',
              '/img/canchas_6.jpg',
            ]}
          />

          {/* COLUMNA DERECHA (5 columnas) */}
          <div className="grid gap-6 md:col-span-5">
            <Carrusel
              nombre="camarines"
              etiqueta="Camarines y Baños"
              imagenes={[
                '/img/camarin_1.jpg',
                '/img/camarin_2.jpg',
                '/img/camarin_3.jpeg',
                '/img/camarin_4.jpeg',
              ]}
            />

            <Carrusel
              nombre="quinchos"
              etiqueta="Quinchos y Espacios Sociales"
              imagenes={[
                '/img/quincho_1.jpg',
                '/img/quincho_2.jpg',
                '/img/quincho_3.jpg',
              ]}
            />
          </div>
        </div>

        {/* Tarjetas de Servicios Iluminadas */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((servicio) => (
            <div
              key={servicio.titulo}
              className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-7 text-[#071426] shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20"
            >
              {/* Borde superior animado al pasar el cursor */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-lime-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Ícono con Gradiente Verde */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={servicio.path} />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-black text-[#071426]">
                {servicio.titulo}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {servicio.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
