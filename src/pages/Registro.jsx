import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import BrandLogo from '../components/BrandLogo'

export default function Registro() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)

  function actualizar(campo) {
    return (e) => setForm({ ...form, [campo]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    setCargando(true)
    const error = await signUp(form.email, form.password, form.nombre, '')
    setCargando(false)
    if (error) {
      if (/rate limit|email rate limit exceeded/i.test(error.message || '')) {
        setError('Se alcanzó el límite temporal de correos de confirmación. Espera unos minutos antes de crear otra cuenta o utiliza un correo diferente.')
      } else {
        setError(error.message)
      }
      return
    }
    // Si Supabase exige confirmación de correo, avisa en lugar de iniciar sesión
    const { data: sessionData } = await supabase.auth.getSession()
    if (sessionData?.session) {
      navigate('/')
    } else {
      setMensaje('✅ ¡Cuenta creada! Te enviamos un correo de confirmación. Revisa tu bandeja (o spam) y haz clic en el enlace para poder iniciar sesión.')
    }
  }

  const campos = [
    { id: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ej: Juan Pérez' },
    { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'Ej: juan@correo.com' },
    { id: 'password', label: 'Contraseña', type: 'password', placeholder: 'Mínimo 6 caracteres' },
  ]

  return (
    <section className="min-h-screen bg-slate-950 px-5 pb-20 pt-36 text-slate-900 lg:pb-28">
      <div className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-[#F3FBEF] p-7 text-[#071426] shadow-2xl shadow-emerald-950/50 sm:p-10">
        <div className="flex justify-center">
          <BrandLogo />
        </div>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-emerald-800">Únete a CanchaYa</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">Crea tu cuenta</h1>
        <p className="mt-4 text-emerald-950/70">Guarda tus reservas y sigue tu historial de partidos.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/60 p-4 text-center text-sm font-bold text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {campos.map((campo) => (
            <div key={campo.id}>
              <label htmlFor={campo.id} className="mb-2 block text-sm font-bold">
                {campo.label}
              </label>
              <input
                id={campo.id}
                type={campo.type}
                required
                placeholder={campo.id === 'email' ? 'Ej: juan@gmail.com' : campo.placeholder}
                value={form[campo.id]}
                onChange={actualizar(campo.id)}
                className="w-full rounded-xl border border-emerald-800/30 bg-white/80 px-4 py-3.5 font-semibold text-[#071426] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-2xl bg-emerald-700 px-6 py-4 font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 disabled:opacity-60"
          >
            {cargando ? 'Registrando…' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-emerald-950/70">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-bold text-emerald-800 hover:text-emerald-950">
            Ingresar
          </Link>
        </p>
      </div>
    </section>
  )
}
