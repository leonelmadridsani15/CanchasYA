import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ReservarPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [reservaData, setReservaData] = useState({
    canchaId: 16,
    fecha: '2026-03-01',
    horaInicio: '19:00',
    horaFin: '20:00',
    precioTotal: 200,
  });

  const senaAPagar = Math.round(reservaData.precioTotal / 2);

  const handlePagarSena = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Obtener usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Debes iniciar sesión para reservar.');

      let reservaId = null;

      // 2. Insertar o recuperar la reserva existente en estado pendiente
      const { data: reserva, error: reservaError } = await supabase
        .from('reservas_reserva')
        .insert([
          {
            usuario_auth_id: user.id,
            cancha_id: Number(reservaData.canchaId),
            fecha: reservaData.fecha,
            hora_inicio: reservaData.horaInicio,
            hora_fin: reservaData.horaFin,
            precio_total: Number(reservaData.precioTotal),
            estado: 'pendiente'
          }
        ])
        .select()
        .single();

      if (reservaError) {
        if (reservaError.code === '23505') {
          // Si ya existía, recuperamos su ID para reintentar el pago
          const { data: reservaExistente } = await supabase
            .from('reservas_reserva')
            .select('id')
            .eq('cancha_id', Number(reservaData.canchaId))
            .eq('fecha', reservaData.fecha)
            .eq('hora_inicio', reservaData.horaInicio)
            .maybeSingle();

          if (reservaExistente) {
            reservaId = reservaExistente.id;
          } else {
            throw new Error('El horario ya está ocupado.');
          }
        } else {
          throw new Error(`Error BD: ${reservaError.message}`);
        }
      } else {
        reservaId = reserva.id;
      }

      // 3. Invocar Edge Function
      const { data: prefData, error: prefError } = await supabase.functions.invoke(
        'mercadopago-preference',
        {
          body: {
            reserva_id: String(reservaId),
            precio_total: senaAPagar,
            title: `Seña Reserva CanchaYa (${reservaData.fecha} ${reservaData.horaInicio})`
          }
        }
      );

      // 4. Desenmascarar el error real de Supabase / Mercado Pago
      if (prefError) {
        let detalle = prefError.message;
        try {
          const bodyError = await prefError.context.json();
          if (bodyError?.error) detalle = bodyError.error;
        } catch (_) {}
        throw new Error(detalle);
      }

      if (!prefData?.init_point) {
        throw new Error('Mercado Pago no devolvió la URL del checkout.');
      }

      // 5. Redirigir a Mercado Pago
      window.location.href = prefData.init_point;

    } catch (err) {
      console.error('Detalle error:', err);
      setErrorMsg(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Confirmar y Pagar Reserva</h2>
      <p>Fecha: {reservaData.fecha}</p>
      <p>Horario: {reservaData.horaInicio} - {reservaData.horaFin}</p>
      <p>Total cancha: ${reservaData.precioTotal.toLocaleString('es-CL')} CLP</p>
      <p><strong>Seña a pagar (50%): ${senaAPagar.toLocaleString('es-CL')} CLP</strong></p>

      {errorMsg && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '5px', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>
          {errorMsg}
        </div>
      )}

      <button 
        onClick={handlePagarSena} 
        disabled={loading}
        style={{ 
          padding: '12px 20px', 
          backgroundColor: loading ? '#a0aec0' : '#009ee3', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: loading ? 'not-allowed' : 'pointer', 
          fontSize: '16px',
          width: '100%'
        }}
      >
        {loading ? 'Cargando checkout...' : 'Pagar Seña con Mercado Pago'}
      </button>
    </div>
  );
}