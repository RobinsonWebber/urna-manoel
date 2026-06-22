# Urna Eletrônica Escolar com Supabase

Arquivos do projeto:

- `index.html`: tela da urna
- `style.css`: visual da urna
- `app.js`: integração com Supabase
- `supabase.sql`: criação das tabelas e dados de teste

## Como configurar

1. Crie um projeto no Supabase.
2. Vá em SQL Editor.
3. Cole e execute o conteúdo do arquivo `supabase.sql`.
4. Abra o arquivo `app.js`.
5. Troque:

```js
const SUPABASE_URL = "COLE_AQUI_A_URL_DO_SUPABASE";
const SUPABASE_ANON_KEY = "COLE_AQUI_A_CHAVE_ANON_PUBLIC";
```

pelos dados do seu projeto.

## Tabelas

### eleitores
Controla quem pode votar e evita voto duplicado.

### candidatos
Guarda nome, número, sigla do partido e foto.

### votos
Guarda apenas o voto, sem nome nem código do eleitor.

## Observação de segurança

Esta versão é uma base funcional para testes. Para uma votação real, o ideal é proteger a confirmação do voto usando uma função no banco ou uma Edge Function, evitando que alguém altere dados direto pelo navegador.
