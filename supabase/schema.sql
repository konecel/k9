-- K9 Biomechanika – databáze v Supabase.
-- Spusťte jednou v Supabase: SQL Editor → New query → vložit → Run.
-- Každý řádek patří účtu, který ho vytvořil; pravidla (RLS) nikomu jinému
-- nedovolí řádek číst, měnit ani mazat.

create table if not exists public.dogs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.static_exams (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gait_exams (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists static_exams_dog_idx on public.static_exams (dog_id);
create index if not exists gait_exams_dog_idx on public.gait_exams (dog_id);

alter table public.dogs enable row level security;
alter table public.static_exams enable row level security;
alter table public.gait_exams enable row level security;

drop policy if exists "own dogs" on public.dogs;
create policy "own dogs" on public.dogs
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own static exams" on public.static_exams;
create policy "own static exams" on public.static_exams
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own gait exams" on public.gait_exams;
create policy "own gait exams" on public.gait_exams
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Fotografie ze statické analýzy: soukromé úložiště, každý účet má vlastní složku
-- pojmenovanou svým id a nikam jinam nevidí.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
  on conflict (id) do nothing;

drop policy if exists "own photos" on storage.objects;
create policy "own photos" on storage.objects
  for all to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
