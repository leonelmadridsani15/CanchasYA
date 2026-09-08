import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { esAdmin } from '../lib/constants'

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
      <div className="relative w-full max-w-md rounded-3xl border border-emerald-500/20 bg-slate-900/80 p-8 text-white shadow-2xl shadow-emerald-950/50 backdrop-blur-2xl sm:p-10">
        {/* DECORACIÓN: Línea superior brillante */}
        <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

        {/* ENCABEZADO */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 shadow-inner">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
            CanchaYa
          </div>
          <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">¡Hola de nuevo!</h1>
          <p className="mt-2 text-xs font-medium text-slate-400">Ingresa a tu cuenta para reservar tu cancha en segundos.</p>
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
            <label htmlFor="email" className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">
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
              placeholder="Ej: juan@correo.com"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 px-4 py-3.5 text-sm font-semibold text-white shadow-inner transition-all placeholder:text-slate-500 focus:border-emerald-400 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">
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
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 px-4 py-3.5 text-sm font-semibold text-white shadow-inner transition-all placeholder:text-slate-500 focus:border-emerald-400 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
            />
          </div>

          {/* BOTÓN CON EFECTO DE GLOW */}
          <button
            type="submit"
            disabled={cargando}
            className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-px text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] hover:shadow-emerald-500/40 active:scale-[0.99] disabled:opacity-60"
          >
            <div className="rounded-[15px] bg-slate-950/20 px-6 py-4 transition group-hover:bg-transparent">
              <span className="flex items-center justify-center gap-2 font-black text-white">
                {cargando ? 'Ingresando…' : 'Ingresar a jugar ⚽'}
              </span>
            </div>
          </button>
        </form>

        {/* PIE DE TARJETA */}
        <div className="mt-8 border-t border-slate-800/80 pt-6 text-center">
          <p className="text-xs font-medium text-slate-400">
            ¿Aún no tienes cuenta?
            <Link
              to="/registro"
              className="ml-1 font-bold text-emerald-400 transition hover:text-emerald-300 hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
