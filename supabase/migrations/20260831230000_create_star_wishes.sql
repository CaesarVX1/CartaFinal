create table if not exists public.star_wishes (
  id bigint generated always as identity primary key,
  wish text not null,
  created_at timestamptz not null default now(),
  constraint star_wishes_length check (
    char_length(btrim(wish)) between 1 and 600
  )
);

alter table public.star_wishes enable row level security;

revoke all on table public.star_wishes from anon, authenticated;
revoke all on sequence public.star_wishes_id_seq from anon, authenticated;
