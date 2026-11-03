import { Link } from 'react-router-dom'

function BalonFutbol() {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="#071426"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8"
      aria-hidden="true"
    >
      <circle cx="24" cy="24" r="20" fill="#F8FAFC" />
      <path d="m24 14 6 4.4-2.3 7.1h-7.4L18 18.4 24 14Z" fill="#071426" />
      <path d="m24 14-1.6-7.8M30 18.4l7.2-3.1M27.7 25.5l4.7 6.2M20.3 25.5l-4.7 6.2M18 18.4l-7.2-3.1" />
      <path d="m22.4 6.2-8.8 2.9M31.2 9.1l6.6 6.2M32.4 31.7l-1.7 8.1M15.6 31.7l1.7 8.1M10.8 15.3l-2.5 8.5M39.2 23.8l-1.8 8.1" />
      <circle cx="24" cy="24" r="20" />
    </svg>
  )
}

export function BrandMark({ className = '' }) {
  return (
    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16A34A] shadow-md ${className}`}>
      <BalonFutbol />
    </span>
  )
}

export default function BrandLogo({ to = '/', dark = false }) {
  return (
    <Link
      to={to}
      className="group flex shrink-0 items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
      aria-label="CanchaYa, volver al inicio"
    >
      <BrandMark className="transition-transform duration-300 group-hover:rotate-3" />
      <div className="leading-none">
        <div className={`font-display text-2xl font-black tracking-tight ${dark ? 'text-[#071426]' : 'text-[#071426]'}`}>
          CANCHA<span className="text-[#16A34A]">YA</span>
        </div>
        <div className="mt-1 text-[9px] font-bold tracking-[0.3em] text-[#91A4BF]">VIVE EL PARTIDO</div>
      </div>
    </Link>
  )
}
