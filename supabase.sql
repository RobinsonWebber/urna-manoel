-- Ative esta extensão caso ainda não esteja ativa
create extension if not exists pgcrypto;

create table if not exists eleitores (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  nome text not null,
  turma text not null,
  ja_votou boolean default false,
  votou_em timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists candidatos (
  id uuid primary key default gen_random_uuid(),
  numero text unique not null,
  nome text not null,
  sigla_partido text,
  foto_url text,
  cargo text not null default 'Representante de turma',
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists votos (
  id uuid primary key default gen_random_uuid(),
  candidato_id uuid references candidatos(id),
  numero_candidato text not null,
  cargo text not null,
  tipo_voto text not null default 'VALIDO',
  criado_em timestamp with time zone default now()
);

-- Exemplos de candidatos
insert into candidatos (numero, nome, sigla_partido, foto_url, cargo)
values
  ('10', 'Ana Clara', 'TEC', '', 'Representante de turma'),
  ('22', 'João Pedro', 'FUT', '', 'Representante de turma'),
  ('35', 'Maria Eduarda', 'UNI', '', 'Representante de turma')
on conflict (numero) do nothing;

-- Exemplos de eleitores
insert into eleitores (codigo, nome, turma)
values
  ('1001', 'Aluno Teste 1', '5º ano'),
  ('1002', 'Aluno Teste 2', '5º ano'),
  ('1003', 'Aluno Teste 3', '5º ano')
on conflict (codigo) do nothing;

-- IMPORTANTE:
-- Para teste rápido, você pode liberar SELECT/INSERT/UPDATE via Supabase Policies.
-- Para produção escolar, o ideal é usar uma função RPC ou Edge Function para evitar fraude pelo navegador.
