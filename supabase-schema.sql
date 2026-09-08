-- ============================================================
--  CanchaYa · Esquema Supabase (IDEMPOTENTE)
--  Funciona en dos escenarios:
--   A) Base vacía: crea todas las tablas desde cero.
--   B) Base con tablas creadas por Django: solo añade lo que falta
--      (usuario_auth_id, foto_url, RLS y bucket de Storage).
--  Ejecutar en el SQL Editor de Supabase.
-- ============================================================

-- ---------- TABLAS (solo se crean si no existen) ----------
create table if not exists reservas_cancha (
  id bigint generated always as identity primary key,
  nombre varchar(100) not null,
  tipo_pasto varchar(50) not null,
  precio_por_hora numeric(10,2) not null,
  activa boolean not null default true,
  tipo_superficie varchar(30) not null default 'sintetico_fifa',
  formato_juego varchar(20) not null default 'futbol_5',
  es_techada boolean not null default false,
  iluminacion_led boolean not null default true,
  calzado_permitido varchar(180) not null default 'Multitaco / Zapatillas de baby fútbol. No tapones de aluminio',
  tiene_vestuarios boolean not null default false,
  tiene_estacionamiento boolean not null default false,
  tiene_quincho boolean not null default false,
  tiene_bar boolean not null default false,
  tiene_wifi boolean not null default false,
  tiene_tribunas boolean not null default false,
  calificacion_promedio numeric(3,2) not null default 5.0
);

create table if not exists reservas_servicioadicional (
  id bigint generated always as identity primary key,
  nombre varchar(120) not null,
  precio numeric(10,2) not null,
  icono varchar(30) not null
);

create table if not exists reservas_reserva (
  id bigint generated always as identity primary key,
  usuario_auth_id uuid not null references auth.users(id) on delete cascade,
  cancha_id bigint not null references reservas_cancha(id) on delete cascade,
  telefono varchar(30) not null default '',
  fecha date not null,
  hora_inicio time not null,
  estado varchar(20) not null default 'pendiente'
    check (estado in ('pendiente', 'confirmada', 'cancelada', 'bloqueada')),
  mercadopago_payment_id varchar(100) unique,
  confirmation_code varchar(20) unique,
  creado_en timestamptz not null default now(),
  unique (cancha_id, fecha, hora_inicio)
);

create table if not exists reservas_reserva_servicios_adicionales (
  id bigint generated always as identity primary key,
  reserva_id bigint not null references reservas_reserva(id) on delete cascade,
  servicioadicional_id bigint not null references reservas_servicioadicional(id) on delete cascade,
  unique (reserva_id, servicioadicional_id)
);

create table if not exists reservas_resultadopartido (
  id bigint generated always as identity primary key,
  reserva_id bigint not null unique references reservas_reserva(id) on delete cascade,
  equipo_a varchar(100) not null,
  equipo_b varchar(100) not null,
  goles_a integer not null default 0,
  goles_b integer not null default 0,
  mvp_partido varchar(100) not null default '',
  notas text not null default ''
);

create table if not exists reservas_resenacancha (
  id bigint generated always as identity primary key,
  cancha_id bigint not null references reservas_cancha(id) on delete cascade,
  nombre_jugador varchar(120) not null,
  puntuacion integer not null check (puntuacion between 1 and 5),
  comentario text not null,
  fecha_creacion timestamptz not null default now()
);

create table if not exists reservas_fotopartido (
  id bigint generated always as identity primary key,
  resultado_id bigint not null references reservas_resultadopartido(id) on delete cascade,
  foto_url text not null default '',
  fecha_carga timestamptz not null default now()
);

-- ---------- COLUMNAS QUE PUEDE FALTAR (caso tablas de Django) ----------
alter table reservas_reserva
  add column if not exists usuario_auth_id uuid references auth.users(id) on delete cascade;

alter table reservas_fotopartido
  add column if not exists foto_url text;

-- ============================================================
--  Row Level Security
-- ============================================================
alter table reservas_cancha enable row level security;
alter table reservas_servicioadicional enable row level security;
alter table reservas_reserva enable row level security;
alter table reservas_reserva_servicios_adicionales enable row level security;
alter table reservas_resultadopartido enable row level security;
alter table reservas_fotopartido enable row level security;
alter table reservas_resenacancha enable row level security;

drop policy if exists "lectura publica canchas" on reservas_cancha;
create policy "lectura publica canchas" on reservas_cancha for select using (true);

drop policy if exists "lectura publica servicios" on reservas_servicioadicional;
create policy "lectura publica servicios" on reservas_servicioadicional for select using (true);

drop policy if exists "lectura publica resenas" on reservas_resenacancha;
create policy "lectura publica resenas" on reservas_resenacancha for select using (true);

drop policy if exists "lectura publica reservas" on reservas_reserva;
create policy "lectura publica reservas" on reservas_reserva for select using (true);

drop policy if exists "crear reservas propias" on reservas_reserva;
create policy "crear reservas propias" on reservas_reserva
  for insert with check (auth.uid() = usuario_auth_id);

drop policy if exists "actualizar reservas propias" on reservas_reserva;
create policy "actualizar reservas propias" on reservas_reserva
  for update using (auth.uid() = usuario_auth_id);

drop policy if exists "m2m propias" on reservas_reserva_servicios_adicionales;
create policy "m2m propias" on reservas_reserva_servicios_adicionales
  for all using (
    exists (select 1 from reservas_reserva r where r.id = reserva_id and r.usuario_auth_id = auth.uid())
  )
  with check (
    exists (select 1 from reservas_reserva r where r.id = reserva_id and r.usuario_auth_id = auth.uid())
  );

drop policy if exists "resultados propios" on reservas_resultadopartido;
create policy "resultados propios" on reservas_resultadopartido
  for all using (
    exists (select 1 from reservas_reserva r where r.id = reserva_id and r.usuario_auth_id = auth.uid())
  )
  with check (
    exists (select 1 from reservas_reserva r where r.id = reserva_id and r.usuario_auth_id = auth.uid())
  );

drop policy if exists "fotos propias" on reservas_fotopartido;
create policy "fotos propias" on reservas_fotopartido
  for all using (
    exists (
      select 1
      from reservas_resultadopartido rp
      join reservas_reserva r on r.id = rp.reserva_id
      where rp.id = resultado_id and r.usuario_auth_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from reservas_resultadopartido rp
      join reservas_reserva r on r.id = rp.reserva_id
      where rp.id = resultado_id and r.usuario_auth_id = auth.uid()
    )
  );

-- ============================================================
--  Storage: bucket público para fotos de partidos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('canchasya-media', 'canchasya-media', true)
on conflict (id) do nothing;

drop policy if exists "lectura publica fotos" on storage.objects;
create policy "lectura publica fotos" on storage.objects
  for select using (bucket_id = 'canchasya-media');

drop policy if exists "subida autenticada fotos" on storage.objects;
create policy "subida autenticada fotos" on storage.objects
  for insert with check (bucket_id = 'canchasya-media' and auth.role() = 'authenticated');
