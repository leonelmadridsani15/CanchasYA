import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { TABLES, money, fechaCorta } from '../lib/constants'
import DivideTurno from '../components/reservas/DivideTurno'

export default function PagoResultado() {
  const { reservaId } = useParams()
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from(TABLES.reserva)
        .select('*, cancha:reservas_cancha(nombre, precio_por_hora)')
        .eq('id', reservaId)
        .single()
      if (error) setError(error.message)
      else setReserva(data)
    }
    cargar()
  }, [reservaId])

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-5 pb-20 pt-36 text-center lg:pb-28">
        <div className="rounded-2xl border border-rose-300 bg-rose-100/60 p-10 text-rose-900">
          <h1 className="text-2xl font-black">No encontramos la reserva</h1>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </section>
    )
  }

  if (!reserva) {
    return <section className="px-5 pt-36 text-center text-slate-500">Cargando…</section>
  }

  const pagado = reserva.estado === 'confirmada'
  const total = Number(reserva.cancha.precio_por_hora)
  const totalAbonado = pagado ? total / 2 : 0

  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 pt-36 text-center text-slate-900 lg:pb-28">
      {pagado ? (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white shadow-glow">
            ✓
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Pago aprobado</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight">Reserva confirmada.</h1>
          <p className="mt-5 text-lg text-slate-500">
            {reserva.cancha.nombre} · {fechaCorta(reserva.fecha)} · {reserva.hora_inicio.slice(0, 5)}
          </p>
          {reserva.confirmation_code && (
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Código de confirmación: <strong className="text-emerald-600">{reserva.confirmation_code}</strong>
            </p>
          )}
          {reserva.mercadopago_payment_id?.startsWith('PAY-TEST') && (
            <p className="mt-2 text-sm text-slate-500">Pago simulado: {reserva.mercadopago_payment_id}</p>
          )}

          <DivideTurno
            total={total}
            pagado={totalAbonado}
            reserva={{
              cancha: reserva.cancha.nombre,
              fecha: fechaCorta(reserva.fecha),
              hora: reserva.hora_inicio.slice(0, 5),
            }}
          />
        </>
      ) : (
        <>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-2xl font-black text-slate-900">
            !
          </div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-amber-400">Pago pendiente</p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight">Aún no está confirmada.</h1>
          <p className="mt-5 text-lg text-slate-500">Puedes revisar el estado de tu pago con Mercado Pago.</p>
        </>
      )}

      <Link
        to="/"
        className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
      >
        Ver canchas
      </Link>
    </section>
  )
}
