/*
 * `npm run dev` com a escolha do ambiente (banco do Supabase e chaves):
 *
 *   APP_ENV=hml         → .env.hml por cima do .env.local (banco "blessfit-hml")
 *   APP_ENV=production  → .env.local.producao (banco de PRODUÇÃO: pedidos e clientes reais)
 *
 * De onde vem o APP_ENV, em ordem: `npm run dev:hml` / `npm run dev:prod` > variável do terminal >
 * linha `APP_ENV=` do .env.local > hml. As variáveis carregadas aqui valem mais que os arquivos .env
 * que o Next lê depois. Só vale para o `next dev` local: a Vercel usa as variáveis do painel.
 */
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { parseEnv } from 'node:util'

const FILES = { hml: '.env.hml', production: '.env.local.producao' }

const read = (file) => (existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : null)

const args = process.argv.slice(2)
const fromArgs = args[0] in FILES ? args.shift() : undefined
const target = fromArgs ?? process.env.APP_ENV ?? read('.env.local')?.APP_ENV ?? 'hml'

if (!(target in FILES)) {
  console.error(`\n  APP_ENV inválido: "${target}". Use "hml" ou "production".\n`)
  process.exit(1)
}
const vars = read(FILES[target])
if (!vars) {
  console.error(`\n  Arquivo ${FILES[target]} não encontrado (é ele que guarda as chaves de ${target}).\n`)
  process.exit(1)
}

const env = { ...process.env, ...vars, APP_ENV: target, NEXT_PUBLIC_APP_ENV: target }
const db = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https:\/\//, '') ?? '(sem NEXT_PUBLIC_SUPABASE_URL)'
if (target === 'production') {
  console.log(`\n\x1b[41m\x1b[97m  PRODUÇÃO  \x1b[0m \x1b[31mbanco ${db} — pedidos, clientes e estoque REAIS\x1b[0m\n`)
} else {
  console.log(`\n\x1b[43m\x1b[30m  HML  \x1b[0m banco ${db} (${FILES[target]})\n`)
}

const next = createRequire(import.meta.url).resolve('next/dist/bin/next')
const child = spawn(process.execPath, [next, 'dev', ...args], { stdio: 'inherit', env })
child.on('exit', (code, signal) => (signal ? process.kill(process.pid, signal) : process.exit(code ?? 0)))
