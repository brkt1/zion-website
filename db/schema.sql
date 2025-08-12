create table public.enhanced_cards (
  id uuid not null default extensions.uuid_generate_v4 (),
  card_number double precision not null,
  duration integer not null,
  game_type_id uuid not null,
  route_access text[] not null default '{}'::text[],
  used boolean not null default false,
  created_at timestamp with time zone not null default now(),
  player_id uuid null,
  created_by uuid null,
  constraint enhanced_cards_pkey primary key (id),
  constraint enhanced_cards_card_number_key unique (card_number),
  constraint enhanced_cards_created_by_fkey foreign KEY (created_by) references auth.users (id) on delete set null,
  constraint enhanced_cards_game_type_id_fkey foreign KEY (game_type_id) references game_types (id) on delete CASCADE,
  constraint enhanced_cards_player_id_fkey foreign KEY (player_id) references auth.users (id)
) TABLESPACE pg_default;

create index IF not exists enhanced_cards_game_type_idx on public.enhanced_cards using btree (game_type_id) TABLESPACE pg_default;

create index IF not exists enhanced_cards_used_idx on public.enhanced_cards using btree (used) TABLESPACE pg_default;

create index IF not exists enhanced_cards_player_idx on public.enhanced_cards using btree (player_id) TABLESPACE pg_default;

create index IF not exists idx_enhanced_cards_created_by on public.enhanced_cards using btree (created_by) TABLESPACE pg_default;

create index IF not exists enhanced_cards_card_number_idx on public.enhanced_cards using btree (card_number) TABLESPACE pg_default;

create index IF not exists idx_enhanced_cards_card_number on public.enhanced_cards using btree (card_number) TABLESPACE pg_default;