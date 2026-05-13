#!/usr/bin/env node
/**
 * Interactive CLI for adding new portfolio items / now-feed entries.
 *
 * Usage:
 *   npm run add        → menu
 *   npm run add now    → quick add to Now feed
 *   npm run add work   → add to Work portfolio
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const ROOT = path.resolve(new URL('..', import.meta.url).pathname)
const WORK_PATH = path.join(ROOT, 'content', 'work.json')
const NOW_PATH = path.join(ROOT, 'content', 'now.json')

const rl = readline.createInterface({ input, output })

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  gold: '\x1b[38;5;215m',
  cream: '\x1b[38;5;230m',
  red: '\x1b[38;5;203m',
}

const banner = () => {
  console.log()
  console.log(`${ANSI.gold}${ANSI.bold}adam.${ANSI.reset}${ANSI.dim} — content tool${ANSI.reset}`)
  console.log(`${ANSI.dim}─────────────────────${ANSI.reset}`)
}

async function ask(q, def = '') {
  const suffix = def ? ` ${ANSI.dim}(${def})${ANSI.reset}` : ''
  const a = await rl.question(`${ANSI.gold}›${ANSI.reset} ${q}${suffix}: `)
  return a.trim() || def
}

async function readJson(p) {
  const txt = await fs.readFile(p, 'utf8')
  return JSON.parse(txt)
}

async function writeJson(p, data) {
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const today = () => new Date().toISOString().slice(0, 10)

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

async function addNow() {
  console.log(`${ANSI.cream}\n→ Dodawanie wpisu do Now / Latest feed${ANSI.reset}\n`)
  const title = await ask('Tytuł')
  if (!title) {
    console.log(`${ANSI.red}Anulowano — brak tytułu.${ANSI.reset}`)
    return
  }
  const body = await ask('Treść (1-3 zdania)')
  const tag = await ask('Tag (skill/tooling/automation/build/music/ai-video)', 'build')
  const date = await ask('Data', today())

  const data = await readJson(NOW_PATH)
  data.items.unshift({ date, title, body, tag })
  await writeJson(NOW_PATH, data)
  console.log(`${ANSI.gold}✓ Dodano do content/now.json${ANSI.reset}`)
  console.log(`${ANSI.dim}  ${title}${ANSI.reset}`)
}

async function addWork() {
  console.log(`${ANSI.cream}\n→ Dodawanie projektu do Selected Work${ANSI.reset}\n`)
  const title = await ask('Tytuł projektu')
  if (!title) {
    console.log(`${ANSI.red}Anulowano — brak tytułu.${ANSI.reset}`)
    return
  }
  const subtitle = await ask('Podtytuł (krótki)')
  const description = await ask('Opis (2-3 zdania)')
  const category = await ask(
    'Kategoria (video/photo/automation/app/website/music)',
    'website',
  )
  const tags = (await ask('Tagi (po przecinku)')).split(',').map((s) => s.trim()).filter(Boolean)
  const stack = (await ask('Stack (po przecinku)')).split(',').map((s) => s.trim()).filter(Boolean)
  const cover = await ask('Cover (ścieżka, np. /work/foo.svg lub Enter dla brak)', '')
  const link = await ask('Link zewnętrzny (lub Enter)', '')
  const featured = (await ask('Featured? (y/n)', 'n')).toLowerCase().startsWith('y')
  const date = await ask('Data', today())
  const id = slugify(title)

  const item = {
    id,
    category,
    title,
    subtitle,
    description,
    tags,
    stack,
    date,
    cover: cover || null,
    link: link || null,
    featured,
  }

  const data = await readJson(WORK_PATH)
  data.items.unshift(item)
  await writeJson(WORK_PATH, data)
  console.log(`${ANSI.gold}✓ Dodano do content/work.json${ANSI.reset}`)
  console.log(`${ANSI.dim}  ${title} (${category}) — id: ${id}${ANSI.reset}`)
  if (!cover) {
    console.log(
      `${ANSI.dim}  Tip: dorzuć cover do public/work/${id}.svg i zaktualizuj pole "cover".${ANSI.reset}`,
    )
  }
}

async function main() {
  banner()
  const mode = process.argv[2]
  let choice = mode

  if (!choice) {
    console.log(`Co dodajemy?`)
    console.log(`  ${ANSI.gold}1${ANSI.reset}  Now / Latest (krótki wpis)`)
    console.log(`  ${ANSI.gold}2${ANSI.reset}  Work (pełny projekt)`)
    const a = await ask('Wybierz', '1')
    choice = a === '2' || a === 'work' ? 'work' : 'now'
  }

  if (choice === 'now') await addNow()
  else if (choice === 'work') await addWork()
  else console.log(`${ANSI.red}Nieznany tryb: ${choice}${ANSI.reset}`)

  rl.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
