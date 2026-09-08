# CanchaYa Frontend (React + Vite + Tailwind + Supabase)

## Desarrollo
```bash
cd frontend
npm install
cp .env.example .env   # y completa tus claves
npm run dev
```

## Despliegue de Edge Functions (Mercado Pago)
Los secrets viven solo en el servidor:

```bash
supabase login
supabase link --project-ref TU_REF
supabase secrets set MERCADOPAGO_ACCESS_TOKEN=APP_USR_... SITE_URL=https://tu-dominio

supabase functions deploy mercadopago-preference
supabase functions deploy mercadopago-webhook --no-verify-jwt
```

- `mercadopago-preference`: crea la preferencia de la seña (50%) y devuelve `init_point`.
  Si no hay `MERCADOPAGO_ACCESS_TOKEN` configurado responde `{ simulacion: true }`
  y el frontend cae al pago simulado.
- `mercadopago-webhook`: recibe las notificaciones de Mercado Pago, verifica el pago
  contra la API y confirma la reserva con código `CONF-XXXXXXXX`.

Registra el webhook en Mercado Pago:
`https://TU_REF.supabase.co/functions/v1/mercadopago-webhook` (evento `payment`).

## Base de datos
Opción recomendada (base limpia, sin restos de Django):
1. Ejecuta **`limpieza-django.sql`** — elimina las tablas de Django que ya no se usan. ⚠️ Borra datos permanentemente.
2. Ejecuta **`supabase-schema.sql`** — crea las tablas limpias que usa el frontend (RLS + bucket de Storage incluidos).

Alternativa: si prefieres conservar las tablas de Django y conviviendo con ellas,
ejecuta `supabase-migracion-django.sql` (añade `usuario_auth_id`, `foto_url`, RLS y bucket).

## Datos de ejemplo
Tras crear las tablas, ejecuta `seed.sql` en el SQL Editor para poblar
6 canchas, 5 servicios adicionales y reseñas (con promedios recalculados).
