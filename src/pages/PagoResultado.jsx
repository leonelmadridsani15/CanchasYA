import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function PagoResultado() {
  const { reservaId } = useParams();
  const [searchParams] = useSearchParams();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusUrl = searchParams.get('status') || searchParams.get('collection_status');

  useEffect(() => {
    async function fetchReserva() {
      try {
        const { data, error } = await supabase
          .from('reservas_reserva')
          .select('*')
          .eq('id', reservaId)
          .single();

        if (error) throw error;
        setReserva(data);
      } catch (err) {
        console.error('Error al consultar estado:', err);
      } finally {
        setLoading(false);
      }
    }

    if (reservaId) {
      fetchReserva();
    } else {
      setLoading(false);
    }
  }, [reservaId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Verificando pago...</div>;

  return (
    <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      {statusUrl === 'approved' || reserva?.estado === 'confirmada' ? (
        <div style={{ border: '1px solid #4CAF50', padding: '2rem', borderRadius: '8px', backgroundColor: '#e8f5e9' }}>
          <h2 style={{ color: '#2e7d32' }}>¡Pago Exitoso!</h2>
          <p>Tu reserva ha sido confirmada con éxito.</p>
          {reserva?.confirmation_code && (
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Código de confirmación: <span style={{ color: '#1565c0' }}>{reserva.confirmation_code}</span>
            </p>
          )}
        </div>
      ) : statusUrl === 'pending' ? (
        <div style={{ border: '1px solid #ff9800', padding: '2rem', borderRadius: '8px', backgroundColor: '#fff3e0' }}>
          <h2 style={{ color: '#ef6c00' }}>Pago Pendiente</h2>
          <p>Tu pago está siendo procesado por Mercado Pago.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #f44336', padding: '2rem', borderRadius: '8px', backgroundColor: '#ffebee' }}>
          <h2 style={{ color: '#c62828' }}>Pago Cancelado o Fallido</h2>
          <p>No se pudo completar la transacción. Intenta nuevamente.</p>
        </div>
      )}
    </div>
  );
}