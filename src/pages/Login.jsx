import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { esAdmin } from '../lib/constants'
import BrandLogo from '../components/BrandLogo'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setCargando(true)
    const error = await signIn(email, password)
    setCargando(false)
    if (error) {
      const msg = error.message || ''
      if (/not confirmed|email_not_confirmed/i.test(msg)) {
        setError('⚠️ Tu correo aún no está confirmado. Revisa tu bandeja (o spam) y haz clic en el enlace de confirmación que te enviamos.')
      } else {
        setError('⚠️ Correo o contraseña incorrectos.')
      }
      return
    }
    // Admin va directo al dashboard, usuarios normales al inicio
    if (esAdmin({ email })) {
      navigate('/dashboard')
    } else {
      navigate('/')
    }
  }

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-5 pb-20 pt-32 lg:pb-28 lg:pt-40">
      {/* FONDO DINÁMICO: Luces ambientales y textura de estadio */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[130px]"></div>
        <div className="absolute -bottom-32 -right-20 h-[500px] w-[500px] rounded-full bg-lime-500/15 blur-[140px]"></div>
        <div className="absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/15 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* TARJETA PRINCIPAL (GLASSMORPHISM) */}
      <div className="relative w-full max-w-md rounded-3xl border border-emerald-100 bg-[#F3FBEF] p-8 text-[#071426] shadow-2xl shadow-emerald-950/50 sm:p-10">
        {/* DECORACIÓN: Línea superior brillante */}
        <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

        {/* ENCABEZADO */}
        <div className="text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-[#071426] sm:text-4xl">¡Hola de nuevo!</h1>
          <p className="mt-2 text-xs font-medium text-emerald-950/70">Ingresa a tu cuenta para reservar tu cancha en segundos.</p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/30 bg-rose-950/50 p-4 text-center text-xs font-bold text-rose-300 shadow-sm backdrop-blur-md"
            >
              {error}
            </div>
          )}

          {/* CORREO */}
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-black uppercase tracking-wider text-emerald-950">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: juan@gmail.com"
              className="w-full rounded-2xl border border-emerald-800/30 bg-white/80 px-4 py-3.5 text-sm font-semibold text-[#071426] shadow-inner transition-all placeholder:text-slate-500 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-black uppercase tracking-wider text-emerald-950">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-emerald-800/30 bg-white/80 px-4 py-3.5 text-sm font-semibold text-[#071426] shadow-inner transition-all placeholder:text-slate-500 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {/* BOTÓN CON EFECTO DE GLOW */}
          <button
            type="submit"
            disabled={cargando}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 to-[#0B1B33] p-px text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/25 transition-all hover:scale-[1.01] hover:shadow-emerald-900/40 active:scale-[0.99] disabled:opacity-60"
          >
            <div className="rounded-[15px] bg-transparent px-6 py-4 transition group-hover:bg-white/10">
              <span className="flex items-center justify-center gap-2 font-black text-white">
                {cargando ? 'Ingresando…' : 'Ingresar'}
              </span>
            </div>
          </button>
        </form>

        {/* PIE DE TARJETA */}
        <div className="mt-8 border-t border-emerald-800/20 pt-6 text-center">
          <p className="text-xs font-medium text-emerald-950/70">
            ¿Aún no tienes cuenta?
            <Link
              to="/registro"
              className="ml-1 font-bold text-emerald-800 transition hover:text-emerald-950 hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
