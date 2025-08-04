-- PostgreSQL schema for Enhanced Cards, Card Users, Global Leaderboard, and Session Scores

-- 0) Game Types
CREATE TABLE public.game_types (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  name text NOT NULL,
  description text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT game_types_pkey PRIMARY KEY (id),
  CONSTRAINT game_types_name_key UNIQUE (name)
);
-- enable row level security on game_types
alter table public.game_types enable row level security;
-- allow public to view game_types
create policy "Public can view game_types" on public.game_types
  for select using (true);
-- allow admins to manage game_types
create policy "Admins can manage game_types" on public.game_types
  for all using (auth.role() in ('admin','super_admin'));

-- 1) Enhanced cards table
create extension if not exists "uuid-ossp";
create table public.enhanced_cards (
  id           uuid        primary key default uuid_generate_v4(),
  card_number  text        not null unique,
  duration     integer     not null,
  game_type_id uuid        not null references public.game_types(id) on delete cascade,
  route_access text[]      not null default '{}',
  used         boolean     not null default false,
  created_at   timestamptz not null default now(),
  player_id    uuid        null    references auth.users(id)
);

-- enable row level security on enhanced_cards
alter table public.enhanced_cards enable row level security;

-- allow admins to manage all cards
create policy "Admins can manage all cards" on public.enhanced_cards
  for all using (auth.role() in ('admin', 'super_admin'));

-- allow users to view their own cards
create policy "Users can view their own cards" on public.enhanced_cards
  for select using (player_id = auth.uid());

-- allow users to link cards to themselves (update player_id)
create policy "Users can link cards to themselves" on public.enhanced_cards
  for update using (player_id = auth.uid()) with check (player_id = auth.uid());

-- 2) Link scanned cards to users
create table public.card_users (
  id        uuid        primary key default uuid_generate_v4(),
  card_id   uuid        not null references public.enhanced_cards(id) on delete cascade,
  user_id   uuid        not null references auth.users(id) on delete cascade,
  linked_at timestamptz not null default now()
);
-- enable row level security on card_users
alter table public.card_users enable row level security;
-- allow users to link and view only their own card_user records
create policy "Users can link their own cards" on public.card_users
  for insert with check (user_id = auth.uid());
create policy "Users can view their own card links" on public.card_users
  for select using (user_id = auth.uid());
-- 2.1) Record the signed-in email when linking cards
alter table public.card_users add column scanner_email text;

-- 3) Global leaderboard
create table public.global_leaderboard (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references auth.users(id),
  total_score   integer     not null default 0,
  last_played   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- enable row level security on global_leaderboard
alter table public.global_leaderboard enable row level security;
-- public can read leaderboard, users can update their own score
create policy "Public can view leaderboard" on public.global_leaderboard
  for select using (true);
create policy "Users can update own leaderboard" on public.global_leaderboard
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4) Per-session scores
create table public.session_scores (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        not null references auth.users(id),
  game_type  uuid        not null references public.game_types(id),
  score      integer     not null,
  session_at timestamptz not null default now()
);
-- enable row level security on session_scores
alter table public.session_scores enable row level security;
-- allow users to insert and view only their own session scores
create policy "Users can insert session scores for themselves" on public.session_scores
  for insert with check (user_id = auth.uid());
create policy "Users can view their own session scores" on public.session_scores
  for select using (user_id = auth.uid());

-- 5) Admin activity log
create table public.admin_activity_log (
  id          uuid        primary key default uuid_generate_v4(),
  admin_id    uuid        not null references auth.users(id) on delete cascade,
  event_type  text        not null,
  description text        not null,
  created_at  timestamptz not null default now()
);
-- enable row level security on admin_activity_log
alter table public.admin_activity_log enable row level security;
-- allow only admins and super_admin to insert activity logs
create policy "Admins can insert activity logs" on public.admin_activity_log
  for insert with check (auth.role() in ('admin','super_admin'));
-- allow only admins and super_admin to view activity logs
create policy "Admins can view activity logs" on public.admin_activity_log
  for select using (auth.role() in ('admin','super_admin'));

-- 6) Certificates issued
create table public.certificates (
  id             uuid        primary key default uuid_generate_v4(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  certificate    text        not null,
  issued_at      timestamptz not null default now()
);
-- enable row level security on certificates
alter table public.certificates enable row level security;
-- allow users to view their own certificates
create policy "Users can view own certificates" on public.certificates
  for select using (user_id = auth.uid());
-- allow admins to insert certificates
create policy "Admins can insert certificates" on public.certificates
  for insert with check (auth.role() in ('admin','super_admin'));
-- allow admins to view all certificates
create policy "Admins can view certificates" on public.certificates
  for select using (auth.role() in ('admin','super_admin'));

-- 7) Cafe owners management
create table public.cafe_owners (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  cafe_name   text        not null,
  created_at  timestamptz not null default now()
);
-- enable row level security on cafe_owners
alter table public.cafe_owners enable row level security;
-- allow users to insert own cafe owner record
create policy "Users can insert own cafe owner" on public.cafe_owners
  for insert with check (user_id = auth.uid());
-- allow users to view their own cafe owner record
create policy "Users can view own cafe owner" on public.cafe_owners
  for select using (user_id = auth.uid());
-- allow admins to view all cafe owners
create policy "Admins can view cafe owners" on public.cafe_owners
  for select using (auth.role() in ('admin','super_admin'));

-- 8) Permissions and their assignment
create table public.permissions (
  name        text        primary key,
  description text
);
-- enable row level security on permissions
alter table public.permissions enable row level security;
-- allow public to view permissions
create policy "Public can view permissions" on public.permissions
  for select using (true);
-- allow admins to insert permissions
create policy "Admins can insert permissions" on public.permissions
  for insert with check (auth.role() in ('admin','super_admin'));
create table public.user_permissions (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  permission_name  text        not null references public.permissions(name) on delete cascade,
  granted_at       timestamptz not null default now()
);
-- enable row level security on user_permissions
alter table public.user_permissions enable row level security;
-- allow users to view their own permissions
create policy "Users can view own permissions" on public.user_permissions
  for select using (user_id = auth.uid());
-- allow admins to insert user permissions
create policy "Admins can insert user permissions" on public.user_permissions
  for insert with check (auth.role() in ('admin','super_admin'));
-- allow admins to delete user permissions
create policy "Admins can delete user permissions" on public.user_permissions
  for delete using (auth.role() in ('admin','super_admin'));

-- 9) Permission requests by users
create table public.permission_requests (
  id               uuid        primary key default uuid_generate_v4(),
  user_id          uuid        not null references auth.users(id) on delete cascade,
  permission_name  text        not null,
  status           text        not null default 'pending' check (status in ('pending','approved','rejected')),
  requested_at     timestamptz not null default now(),
  reviewed_by      uuid        references auth.users(id),
  reviewed_at      timestamptz
);
-- enable row level security on permission_requests
alter table public.permission_requests enable row level security;
-- allow users to insert permission requests
create policy "Users can insert permission requests" on public.permission_requests
  for insert with check (user_id = auth.uid());
-- allow users to view their own permission requests
create policy "Users can view own permission requests" on public.permission_requests
  for select using (user_id = auth.uid());
-- allow admins to view permission requests
create policy "Admins can view permission requests" on public.permission_requests
  for select using (auth.role() in ('admin','super_admin'));
-- allow admins to update permission requests
create policy "Admins can update permission requests" on public.permission_requests
  for update using (auth.role() in ('admin','super_admin'));

-- 10) User-specific route accesses
create table public.user_routes (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  route_path  text        not null,
  created_at  timestamptz not null default now()
);
-- enable row level security on user_routes
alter table public.user_routes enable row level security;
-- allow users to insert their own routes
create policy "Users can insert own routes" on public.user_routes
  for insert with check (user_id = auth.uid());
-- allow users to view their own routes
create policy "Users can view own routes" on public.user_routes
  for select using (user_id = auth.uid());
-- allow admins to view user routes
create policy "Admins can view user routes" on public.user_routes
  for select using (auth.role() in ('admin','super_admin'));
