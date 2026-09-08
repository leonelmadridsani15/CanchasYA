// Supabase Edge Function: mercadopago-preference
// Crea la preferencia de pago de la seña (50%) para una reserva.
// Desplegar: supabase functions deploy mercadopago-preference
// Secret necesario: supabase secrets set MERCADOPAGO_ACCESS_TOKEN=...
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { reservaId } = await req.json()
    const token = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!token) {
      return new Response(JSON.stringify({ simulacion: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    // Cliente con clave de servicio para leer la reserva sin depender de RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: reserva, error } = await supabase
      .from('reservas_reserva')
      .select('id, fecha, hora_inicio, estado, cancha:reservas_cancha(nombre, precio_por_hora), usuario:usuario_auth_id(email)')
      .eq('id', reservaId)
      .single()

    if (error || !reserva) {
      return new Response(JSON.stringify({ error: 'Reserva no encontrada' }), {
        status: 404,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    if (reserva.estado === 'confirmada') {
      return new Response(JSON.stringify({ ya_confirmada: true }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const sena = Number(reserva.cancha.precio_por_hora) / 2
    const origin = new URL(req.url).origin

    const preference = {
      items: [
        {
          title: `Seña - ${reserva.cancha.nombre}`,
          quantity: 1,
          unit_price: sena,
          currency_id: 'COP',
        },
      ],
      external_reference: String(reserva.id),
      payer: { email: reserva.usuario?.email },
      back_urls: {
        success: `${Deno.env.get('SITE_URL') ?? origin}/pago-resultado/${reserva.id}`,
        failure: `${Deno.env.get('SITE_URL') ?? origin}/pago-resultado/${reserva.id}`,
        pending: `${Deno.env.get('SITE_URL') ?? origin}/pago-resultado/${reserva.id}`,
      },
      auto_return: 'approved',
      notification_url: `${origin}/functions/v1/mercadopago-webhook`,
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(preference),
    })
    const data = await mpRes.json()

    return new Response(
      JSON.stringify({ init_point: data.init_point ?? data.sandbox_init_point ?? null }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
})
