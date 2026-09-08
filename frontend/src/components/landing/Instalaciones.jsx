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
      className={`group relative overflow-hidden rounded-3xl ${grande ? 'h-[420px] md:col-span-7 md:h-[500px]' : 'h-[240px]'}`}
    >
      {imagenes.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === indice ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={src} alt={`${etiqueta} ${i + 1}`} className="h-full w-full object-cover" />
        </div>
      ))}

      {/* Capa Sombra */}
      <div
        className={`absolute inset-0 bg-gradient-to-t to-transparent ${
          grande ? 'from-[#071426]/90 via-[#071426]/20' : 'from-[#071426]/80'
        }`}
      ></div>

      {/* Etiqueta y Título */}
      {grande ? (
        <div className="absolute bottom-0 left-0 p-8">
          <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#071426]">
            {etiqueta}
          </span>
          <h3 className="mt-3 text-2xl font-black md:text-3xl">{titulo}</h3>
        </div>
      ) : (
        <span
          className={`absolute bottom-5 left-5 rounded-full px-4 py-1.5 text-xs font-black ${
            nombre === 'quinchos' ? 'bg-lime-400 text-[#071426]' : 'bg-white text-[#071426]'
          }`}
        >
          {etiqueta}
        </span>
      )}

      {/* Botones de Navegación */}
      <button
        onClick={() => mover(-1)}
        aria-label="Anterior"
        className={`absolute ${posicionBotones.split(' ')[0]} top-1/2 -translate-y-1/2 rounded-full bg-black/40 ${posicionBotones.split(' ')[2]} text-white backdrop-blur-md transition hover:bg-lime-400 hover:text-black`}
      >
        ❮
      </button>
      <button
        onClick={() => mover(1)}
        aria-label="Siguiente"
        className={`absolute ${posicionBotones.split(' ')[1]} top-1/2 -translate-y-1/2 rounded-full bg-black/40 ${posicionBotones.split(' ')[2]} text-white backdrop-blur-md transition hover:bg-lime-400 hover:text-black`}
      >
        ❯
      </button>
    </div>
  )
}

const SERVICIOS = [
  {
    titulo: 'Iluminación LED',
    descripcion: 'Disfrutá tus partidos incluso durante la noche.',
    path: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 3 2 5.5 4 7.5V18h6v-1.5c2-2 4-4.5 4-7.5a7 7 0 0 0-7-7z',
  },
  {
    titulo: 'Camarines',
    descripcion: 'Espacios para prepararte antes y después.',
    path: 'M4 4h7a4 4 0 0 1 4 4v12M12 20h6M15 12h.01M18 12h.01M13.5 15h.01M16.5 15h.01M15 18h.01',
  },
  {
    titulo: 'Estacionamiento',
    descripcion: 'Llegá cómodamente al complejo.',
    path: 'M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M5 17H3v-6l2-5h10l2 5v6h-2M9 17h6',
  },
  {
    titulo: 'Seguridad',
    descripcion: 'Un entorno cómodo para disfrutar.',
    path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
]

export default function Instalaciones() {
  return (
    <section id="instalaciones" className="bg-[#071426] py-20 text-white lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8">
        {/* Encabezado */}
        <div className="mb-12 grid gap-4 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-lime-400">Más que una cancha</span>
            <h2 className="mt-3 font-display text-4xl font-black tracking-tight sm:text-5xl">Nuestras instalaciones</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300 lg:ml-auto">
            Todo preparado para que llegues, juegues y disfrutes. Una experiencia completa desde que entrás.
          </p>
        </div>

        {/* Rejilla de Carruseles */}
        <div className="grid gap-6 md:grid-cols-12">
          <Carrusel
            nombre="canchas"
            grande
            etiqueta="Canchas y Campos"
            titulo="Pasto Sintético FIFA & Iluminación LED"
            imagenes={[
              '/img/canchas_1.jpg',
              '/img/canchas_2.jpg',
              '/img/canchas_3.jpg',
              '/img/canchas_4.jpg',
              '/img/canchas_5.jpg',
              '/img/canchas_6.jpg',
            ]}
          />

          {/* COLUMNA DERECHA (5 columnas): 2 Carruseles apilados */}
          <div className="grid gap-6 md:col-span-5">
            <Carrusel
              nombre="camarines"
              etiqueta="Camarines y Baños"
              imagenes={['/img/camarin_1.jpg', '/img/camarin_2.jpg', '/img/camarin_3.jpeg', '/img/camarin_4.jpeg']}
            />
            <Carrusel
              nombre="quinchos"
              etiqueta="Quinchos, Bar & Social"
              imagenes={['/img/quincho_1.jpg', '/img/quincho_2.jpg', '/img/quincho_3.jpg']}
            />
          </div>
        </div>

        {/* Servicios / Tarjetas de Características */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICIOS.map((servicio) => (
            <div
              key={servicio.titulo}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c4d32] shadow-sm">
                <svg
                  className="h-7 w-7 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={servicio.path} />
                </svg>
              </div>
              <h3 className="mt-4 font-black text-slate-900">{servicio.titulo}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{servicio.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
