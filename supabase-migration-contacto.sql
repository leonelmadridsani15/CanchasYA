-- Ejecutar una sola vez en el SQL Editor de Supabase.
-- Agrega los datos de contacto a reservas existentes sin eliminar información.

alter table public.reservas_reserva
  add column if not exists nombre_contacto varchar(120) not null default 'Cliente registrado',
  add column if not exists email_contacto varchar(254) not null default '',
  add column if not exists telefono varchar(30) not null default '';

-- Completa el correo de las reservas antiguas cuando existe el usuario asociado.
update public.reservas_reserva as reserva
set email_contacto = usuarios.email
from auth.users as usuarios
where reserva.usuario_auth_id = usuarios.id
  and (reserva.email_contacto is null or reserva.email_contacto = '');
