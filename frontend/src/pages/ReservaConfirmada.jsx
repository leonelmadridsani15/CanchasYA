import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { TABLES, money, fechaCorta } from '../lib/constants'
import DivideTurno from '../components/reservas/DivideTurno'

export default function ReservaConfirmada() {
  const { reservaId } = useParams()
  const navigate = useNavigate()
  const [reserva, setReserva] = useState(null)
  const [error, setError] = useState(null)
  const [pagando, setPagando] = useState(false)

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

  async function pagarSena() {
    setPagando(true)

    // 1) Intentar crear preferencia real de Mercado Pago vía Edge Function
    let initPoint = null
    try {
      const { data, error: fnError } = await supabase.functions.invoke('mercadopago-preference', {
        body: { reservaId: Number(reservaId) },
      })
      if (!fnError && data?.init_point) initPoint = data.init_point
    } catch {
      /* sin función desplegada o sin token: caemos al modo simulado */
    }

    // 2) Si hay init_point, redirigimos al checkout de Mercado Pago.
    //    El webhook (mercadopago-webhook) confirmará la reserva al aprobarse.
    if (initPoint) {
      window.location.href = initPoint
      return
    }

    // 3) Modo simulado (equivalente a pago_simulado de Django)
    const paymentId = 'PAY-TEST-' + Math.random().toString(36).slice(2, 10).toUpperCase()
    const confirmationCode = 'CONF-' + Math.random().toString(36).slice(2, 12).toUpperCase()
    const { error: updateError } = await supabase
      .from(TABLES.reserva)
      .update({ estado: 'confirmada', mercadopago_payment_id: paymentId, confirmation_code: confirmationCode })
      .eq('id', reservaId)
    if (updateError) {
      setError(updateError.message)
      setPagando(false)
      return
    }
    navigate(`/pago-resultado/${reservaId}`)
  }

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-20 text-center lg:py-28">
        <div className="rounded-2xl border border-rose-300 bg-rose-100/60 p-10 text-rose-900">
          <h1 className="text-2xl font-black">No encontramos la reserva</h1>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </section>
    )
  }

  if (!reserva) {
    return <section className="px-5 py-20 text-center text-slate-500">Cargando…</section>
  }

  const total = Number(reserva.cancha.precio_por_hora)
  const sena = total / 2

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center text-slate-900 lg:py-28">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white shadow-glow">
        ✓
      </div>
      <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-emerald-600">Reserva pendiente</p>
      <h1 className="mt-3 font-display text-5xl font-bold leading-none tracking-tight">Completa la seña.</h1>

      <div className="mt-10 rounded-2xl border border-emerald-900/50 bg-emerald-950 p-7 text-left text-white shadow-lg">
        <div className="flex justify-between border-b border-emerald-900/50 pb-4">
          <span className="text-slate-500">Cancha</span>
          <strong>{reserva.cancha.nombre}</strong>
        </div>
        <div className="flex justify-between border-b border-emerald-900/50 py-4">
          <span className="text-slate-500">Fecha</span>
          <strong>{fechaCorta(reserva.fecha)}</strong>
        </div>
        <div className="flex justify-between border-b border-emerald-900/50 py-4">
          <span className="text-slate-500">Hora</span>
          <strong>{reserva.hora_inicio.slice(0, 5)}</strong>
        </div>
        <div className="flex justify-between pt-4">
          <span className="text-slate-500">Seña (50%)</span>
          <strong className="font-black text-emerald-600">{money(sena)}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={pagarSena}
        disabled={pagando}
        className="mt-8 inline-block rounded-xl bg-emerald-600 px-7 py-4 font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pagando ? 'Procesando…' : 'Pagar seña'}
      </button>
      <p className="mt-4 text-sm text-slate-500">Modo local: el pago se simulará al continuar.</p>

      <DivideTurno
        total={total}
        pagado={sena}
        reserva={{
          cancha: reserva.cancha.nombre,
          fecha: fechaCorta(reserva.fecha),
          hora: reserva.hora_inicio.slice(0, 5),
        }}
      />

      <div className="mt-8">
        <Link to="/historial" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">
          Ver mi historial →
        </Link>
      </div>
    </section>
  )
}
