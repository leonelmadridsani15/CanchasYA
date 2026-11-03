const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email, nombre, asunto, mensaje } = await request.json()
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const emailFrom = Deno.env.get('EMAIL_FROM')

    if (!resendKey || !emailFrom) {
      throw new Error('Faltan configurar RESEND_API_KEY y EMAIL_FROM en los secretos de Supabase.')
    }
    if (!email || !asunto || !mensaje) {
      throw new Error('Faltan datos para enviar la notificación.')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [email],
        subject: asunto,
        text: `Hola ${nombre || 'Cliente'},\n\n${mensaje}\n\nCanchaYa`,
      }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result?.message || 'Resend rechazó el correo.')
    }

    return new Response(JSON.stringify({ ok: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'No se pudo enviar el correo.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
