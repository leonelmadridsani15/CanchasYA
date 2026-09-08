// Supabase Edge Function: mercadopago-webhook
// Verifica el pago con la API de Mercado Pago y confirma la reserva.
// Desplegar: supabase functions deploy mercadopago-webhook --no-verify-jwt
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

async function verificarPago(paymentId: string) {
  const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!token) return {}
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return {}
  return res.json()
}

function codigoConfirmacion() {
  const hex = crypto.randomUUID().replace(/-/g, '')
  return `CONF-${hex.slice(0, 10).toUpperCase()}`
}

async function confirmarReserva(reservaId: string, paymentId: string) {
  const { data: reserva } = await supabase
    .from('reservas_reserva')
    .select('id, estado, confirmation_code')
    .eq('id', reservaId)
    .single()

  if (!reserva || (reserva.estado === 'confirmada' && reserva.confirmation_code)) return false

  const { error } = await supabase
    .from('reservas_reserva')
    .update({
      estado: 'confirmada',
      mercadopago_payment_id: paymentId,
      confirmation_code: codigoConfirmacion(),
    })
    .eq('id', reservaId)

  return !error
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ detail: 'Método no permitido' }), { status: 405 })
  }

  try {
    const payload = await req.json()
    const paymentId = payload?.data?.id
    if (payload?.type !== 'payment' || !paymentId) {
      return new Response(JSON.stringify({ detail: 'Notificación ignorada' }))
    }

    const payment = await verificarPago(String(paymentId))
    const reservaId = payment?.external_reference

    if (reservaId && payment?.status === 'approved') {
      await confirmarReserva(String(reservaId), String(paymentId))
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ detail: 'Notificación inválida' }), { status: 400 })
  }
})
