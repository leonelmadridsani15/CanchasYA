import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { reserva_id, precio_total, title } = body;

    const mpToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    // Si estás en desarrollo local usamos localhost sin forzar auto_return 
    const siteUrl = (Deno.env.get('SITE_URL') || 'http://localhost:5173').replace(/\/$/, '');

    if (!mpToken) {
      return new Response(
        JSON.stringify({ error: 'Falta configurar MERCADOPAGO_ACCESS_TOKEN en los Secrets de Supabase.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const returnUrl = `${siteUrl}/pago-resultado/${reserva_id}`;

    // Construcción del payload
    const preferencePayload: any = {
      items: [
        {
          id: String(reserva_id),
          title: title || 'Reserva CanchaYa',
          quantity: 1,
          currency_id: 'CLP',
          unit_price: Math.round(Number(precio_total)),
        },
      ],
      back_urls: {
        success: returnUrl,
        failure: returnUrl,
        pending: returnUrl,
      },
      external_reference: String(reserva_id),
    };

    // Solo activamos auto_return si la URL es HTTPS (entorno real desplegado)
    if (siteUrl.startsWith('https://')) {
      preferencePayload.auto_return = 'approved';
    }

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Error recibido de Mercado Pago:', mpData);
      const detalle = mpData.message || mpData.cause?.[0]?.description || 'Error al crear la preferencia.';
      return new Response(
        JSON.stringify({ error: `Mercado Pago dice: ${detalle}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ init_point: mpData.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error interno:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});