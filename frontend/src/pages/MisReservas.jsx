import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { TABLES, ESTADOS_RESERVA, fechaCorta } from '../lib/constants'

export default function MisReservas() {
  const { user } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [reservas, setReservas] = useState(null)
  const [error, setError] = useState(null)
  const [buscando, setBuscando] = useState(false)

  async function buscarReservas(ident) {
    setBuscando(true)
    setError(null)
    const limpio = ident.trim()
    const telefono = limpio.replace(/\D/g, '')
    const esEmail = limpio.includes('@')

    // Equivalente a: Q(usuario__email__iexact=identificador) | Q(telefono=telefono)
    let query = supabase
      .from(TABLES.reserva)
      .select('*, cancha:reservas_cancha(nombre)')
      .order('fecha', { ascending: false })
      .order('hora_inicio', { ascending: false })

    // El correo del usuario vive en auth.users; si coincide con la sesión,
    // filtramos por su id. En otro caso buscamos por teléfono.
    if (esEmail && user && limpio.toLowerCase() === user.email?.toLowerCase()) {
      query = query.eq('usuario_auth_id', user.id)
    } else {
      query = query.eq('telefono', telefono)
    }

    const { data, error: queryError } = await query
    setBuscando(false)
    if (queryError) setError(queryError.message)
    else setReservas(data ?? [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await buscarReservas(identificador)
  }

  return (
    <>
      <section className="bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 lg:px-8 lg:pb-24">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Consulta rápida</p>
          <h1 className="mt-3 max-w-2xl font-display text-5xl font-bold leading-none tracking-tight">
            Encuentra tus reservas.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-500">Ingresa el e-mail o teléfono usado al reservar.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-3xl border border-emerald-900/50 bg-emerald-950 p-5 text-white shadow-lg sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="identificador" className="mb-2 block text-sm font-bold">
              E-mail o teléfono
            </label>
            <input
              id="identificador"
              type="text"
              required
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="cliente@correo.com o 3001234567"
              className="w-full rounded-xl border border-emerald-900 bg-black/40 px-4 py-3.5 font-semibold text-white placeholder:text-emerald-200/40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="rounded-xl bg-emerald-600 px-6 py-3.5 font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {buscando ? 'Buscando…' : 'Buscar reservas'}
          </button>
        </form>

        {error && (
          <div className="mt-8 rounded-2xl border border-rose-300 bg-rose-100/60 p-5 text-sm font-bold text-rose-700">
            {error}
          </div>
        )}

        {reservas !== null && (
          reservas.length > 0 ? (
            <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-900/50 bg-emerald-950 text-white shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="border-b border-emerald-900/50 bg-emerald-900/60 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Cancha</th>
                      <th className="px-6 py-4">Fecha</th>
                      <th className="px-6 py-4">Hora</th>
                      <th className="px-6 py-4">Pago</th>
                      <th className="px-6 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/40">
                    {reservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td className="px-6 py-5 font-semibold">{reserva.cancha?.nombre}</td>
                        <td className="px-6 py-5">{fechaCorta(reserva.fecha)}</td>
                        <td className="px-6 py-5">{reserva.hora_inicio.slice(0, 5)}</td>
                        <td className="px-6 py-5">
                          {reserva.mercadopago_payment_id ? (
                            <span className="font-bold text-emerald-600">Señada</span>
                          ) : (
                            <span className="text-slate-500">Pendiente</span>
                          )}
                        </td>
                        <td className="px-6 py-5 font-semibold">
                          {ESTADOS_RESERVA[reserva.estado] ?? reserva.estado}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-emerald-900/50 bg-emerald-950 p-8 text-center text-slate-500">
              No encontramos reservas con esos datos.
            </div>
          )
        )}
      </section>
    </>
  )
}
