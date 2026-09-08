import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { esAdmin } from '../../lib/constants'

const NAV_LINKS = [
  { hash: '#inicio', label: 'Inicio' },
  { hash: '#canchas', label: 'Canchas' },
  { hash: '#instalaciones', label: 'Instalaciones' },
  { hash: '#nosotros', label: 'Nosotros' },
  { hash: '#ubicacion', label: 'Ubicación' },
  { hash: '#contacto', label: 'Contacto' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [perfilAbierto, setPerfilAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setPerfilAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, hash) => {
    setMenuAbierto(false)
    if (location.pathname !== '/') {
      e.preventDefault()
      navigate(`/${hash}`)
    } else {
      const element = document.querySelector(hash)
      if (element) {
        e.preventDefault()
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-emerald-500/20 bg-white/90 shadow-lg shadow-emerald-950/5 backdrop-blur-md'
          : 'border-b border-slate-200/80 bg-white/95 backdrop-blur-md'
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-4 lg:px-8">
        
        {/* LOGO CON ANIMACIÓN DE AGRANDADO */}
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-3 transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
          aria-label="CanchaYa, volver al inicio"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071426] text-xl shadow-md transition-transform duration-300 group-hover:rotate-6">
            ⚽
          </span>
          <div className="leading-none">
            <div className="font-display text-xl font-black tracking-tight text-[#071426]">
              CANCHA<span className="text-[#16A34A]">YA</span>
            </div>
            <div className="mt-1 text-[9px] font-bold tracking-[0.25em] text-slate-400">VIVE EL PARTIDO</div>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP CON FONDO VERDE CLARO EN HOVER */}
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.hash}
              href={`/${link.hash}`}
              onClick={(e) => handleNavClick(e, link.hash)}
              className="rounded-full px-4 py-2 text-sm font-bold text-[#071426] transition-all duration-200 hover:bg-emerald-50 hover:text-[#16A34A] active:bg-emerald-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACCIONES (MANTENIENDO BOTÓN DE USUARIO INTACTO) */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setPerfilAbierto(!perfilAbierto)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-[#071426] transition hover:border-[#16A34A] hover:bg-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#16A34A] text-xs font-black text-white">
                  {user.email.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-[120px] truncate xl:block">{user.email}</span>
                <svg className={`h-4 w-4 transition-transform ${perfilAbierto ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {perfilAbierto && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold text-slate-400">Sesión como</p>
                    <p className="truncate text-sm font-bold text-[#071426]">{user.email}</p>
                  </div>
                  <Link to="/mis-reservas" onClick={() => setPerfilAbierto(false)} className="block px-4 py-2.5 text-sm font-bold text-[#071426] transition hover:bg-emerald-50 hover:text-[#16A34A]">Mis reservas</Link>
                  <Link to="/historial" onClick={() => setPerfilAbierto(false)} className="block px-4 py-2.5 text-sm font-bold text-[#071426] transition hover:bg-emerald-50 hover:text-[#16A34A]">Mi historial</Link>
                  {esAdmin(user) && (
                    <Link to="/dashboard" onClick={() => setPerfilAbierto(false)} className="block px-4 py-2.5 text-sm font-bold text-[#16A34A] transition hover:bg-emerald-50">Dashboard</Link>
                  )}
                  <div className="my-1 border-t border-slate-100"></div>
                  <button type="button" onClick={() => { signOut(); setPerfilAbierto(false) }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 transition hover:bg-rose-50">Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden rounded-full px-4 py-2 text-sm font-bold text-[#071426] transition-all hover:bg-emerald-50 hover:text-[#16A34A] lg:block">Ingresar</Link>
              <Link to="/registro" className="hidden rounded-full bg-[#16A34A] px-5 py-2.5 text-sm font-black text-white shadow-md shadow-emerald-900/20 transition hover:bg-[#0f8a3d] hover:shadow-lg lg:block">Registrarse</Link>
            </>
          )}

          {/* MENÚ MÓVIL */}
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-[#071426] transition hover:border-[#16A34A] lg:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuAbierto && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <nav className="mx-auto max-w-[1280px] space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.hash}
                href={`/${link.hash}`}
                onClick={(e) => handleNavClick(e, link.hash)}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-[#071426] hover:bg-emerald-50 hover:text-[#16A34A]"
              >
                {link.label}
              </a>
            ))}
            <div className="my-3 border-t border-slate-200"></div>
            {user ? (
              <>
                <p className="px-4 text-xs font-bold text-slate-400">Sesión como</p>
                <p className="truncate px-4 pb-2 text-sm font-bold text-[#071426]">{user.email}</p>
                <Link to="/mis-reservas" onClick={() => setMenuAbierto(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#071426] hover:bg-emerald-50">Mis reservas</Link>
                <Link to="/historial" onClick={() => setMenuAbierto(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#071426] hover:bg-emerald-50">Mi historial</Link>
                {esAdmin(user) && (
                  <Link to="/dashboard" onClick={() => setMenuAbierto(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#16A34A] hover:bg-emerald-50">Dashboard</Link>
                )}
                <button type="button" onClick={() => signOut()} className="mt-2 w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuAbierto(false)} className="block rounded-xl px-4 py-3 text-sm font-bold text-[#071426] hover:bg-emerald-50">Ingresar</Link>
                <Link to="/registro" onClick={() => setMenuAbierto(false)} className="mt-1 block rounded-xl bg-[#16A34A] px-4 py-3 text-center text-sm font-black text-white">Registrarse</Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* LÍNEA DE BRILLO AL HACER SCROLL */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#16A34A]/50 to-transparent transition-opacity duration-500 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </header>
  )
}