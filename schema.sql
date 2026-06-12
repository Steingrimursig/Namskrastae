-- Keyrðu þetta í Supabase: opnaðu verkefnið þitt → "SQL Editor" → "New query" → límdu inn → "Run".

create table if not exists public.haefnividmid (
  id          text primary key,
  subject     text not null,
  merkt       boolean not null default false,
  b5          text not null default '',
  b6          text not null default '',
  b7          text not null default '',
  updated_at  timestamptz not null default now()
);

-- Leyfa lestur og skrif (hentar litlum, traustum hópi sem deilir hlekknum).
alter table public.haefnividmid enable row level security;

drop policy if exists "opinn adgangur" on public.haefnividmid;
create policy "opinn adgangur" on public.haefnividmid
  for all using (true) with check (true);

-- Kveikja á rauntíma-samstillingu fyrir töfluna.
alter publication supabase_realtime add table public.haefnividmid;
