#!/usr/bin/env node
/**
 * Daily Now-feed updater — automatyczny wpis o 18:00.
 *
 * 1. Czyta wszystkie pliki z SecondBrain\Sessions\YYYY-MM-DD-*.md z dnia.
 * 2. Wycina TL;DR + Streszczenie + topics z każdej sesji.
 * 3. Wysyła do lokalnego Ollama qwen3:8b z think:false i format:json.
 * 4. Dopisuje wynikowy wpis {title, body, tag, auto:true} do content/now.json.
 * 5. git add → commit → push (Vercel sam zredeployuje).
 *
 * Idempotentność: jeśli w now.json istnieje wpis z dzisiejszą datą i auto:true,
 * skrypt kończy bez zmian (exit 0).
 *
 * Tryb manualny: `npm run daily-now` (albo `node scripts/daily-now.mjs`).
 * Tryb scheduled: odpalany przez scripts/daily-now.ps1 z Task Scheduler.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)

const ROOT = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))
const NOW_PATH = path.join(ROOT, 'content', 'now.json')
const SESSIONS_DIR = path.join(
  process.env.USERPROFILE || 'C:\\Users\\adamb',
  'OneDrive',
  'Dokumenty',
  'SecondBrain',
  'Sessions',
)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b'
const ALLOWED_TAGS = ['skill', 'tooling', 'automation', 'build', 'ai-video', 'music']

const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a)
const die = (msg, code = 1) => {
  console.error(`[${new Date().toISOString()}] FATAL:`, msg)
  process.exit(code)
}

const todayPL = () => {
  // Pora Warszawy — przesuwamy o offset Europe/Warsaw (CEST=+2 / CET=+1).
  // Dla uproszczenia bierzemy lokalną datę Windowsa, bo Task Scheduler
  // i tak chodzi w lokalnej strefie czasu (komputer w PL).
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function readSessions(dateStr) {
  let entries
  try {
    entries = await fs.readdir(SESSIONS_DIR)
  } catch (e) {
    die(`Nie mogę odczytać ${SESSIONS_DIR}: ${e.message}`)
  }
  const todays = entries.filter((f) => f.startsWith(`${dateStr}-`) && f.endsWith('.md'))
  log(`Znaleziono ${todays.length} sesji z dnia ${dateStr}`)
  const out = []
  for (const f of todays) {
    const full = path.join(SESSIONS_DIR, f)
    const txt = await fs.readFile(full, 'utf8')
    out.push({ file: f, text: txt })
  }
  return out
}

function condense(session) {
  // Wytnij tylko najważniejsze sekcje, żeby nie zalać modelu kontekstem.
  const t = session.text
  const fm = t.match(/^---\n([\s\S]*?)\n---/)?.[1] || ''
  const tldr = t.match(/> \[!tldr\] TL;DR\n> (.+)/)?.[1] || ''
  const streszczenie = t.match(/## 📌 Streszczenie\n([\s\S]+?)(?:\n## |\n---|\n$)/)?.[1]?.trim() || ''
  const fakty = t.match(/## 🔑 Kluczowe fakty\n([\s\S]+?)(?:\n## |\n---|\n$)/)?.[1]?.trim() || ''
  const decyzje = t.match(/## ✅ Decyzje\n([\s\S]+?)(?:\n## |\n---|\n$)/)?.[1]?.trim() || ''
  return `### Sesja: ${session.file}\nFrontmatter:\n${fm}\nTL;DR: ${tldr}\nStreszczenie: ${streszczenie}\nKluczowe fakty: ${fakty}\nDecyzje: ${decyzje}`
}

const PROMPT_SYSTEM = `Jesteś edytorem strony-portfolio Adama Bytniewskiego. Strona promuje pracę z AI — automatyzacje, buildy, narzędzia, tooling, skill-stack, video AI, music AI. Adam codziennie o 18:00 chce wpis "co nowego dziś" do sekcji "Now / Aktualne realizacje".

Z poniższych sesji z dnia wybierz JEDNĄ rzecz najciekawszą, najbardziej związaną z AI/automatyzacją/buildem, którą można pokazać publicznie. Pomijaj prywatne (gotowanie, rodzina, zakupy, terapie). Pomijaj rzeczy banalne (drobne fixy, debug bez wartości narracyjnej).

Wpis MUSI:
- mieć tytuł po polsku, zwięzły (max 70 znaków), bez kropki na końcu
- mieć body 1-3 zdania po polsku, plastyczny język techniczny, bez emoji, bez markdownu
- mieć tag z listy: skill, tooling, automation, build, ai-video, music
- nie zawierać dat ("dziś", "wczoraj") w body — data jest osobnym polem

Output ŚCIŚLE w formacie JSON: {"title": "...", "body": "...", "tag": "..."}. Bez komentarzy, bez markdown code fence, bez chain-of-thought. Sam JSON.`

async function callOllama(digest) {
  const prompt = `${PROMPT_SYSTEM}\n\n=== SESJE Z DZIŚ ===\n${digest}\n=== KONIEC SESJI ===\n\nJSON:`
  log(`Wywołuję Ollama ${MODEL} (${prompt.length} znaków promptu)`)
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      think: false,
      format: 'json',
      options: { temperature: 0.6, num_ctx: 16384 },
    }),
  })
  if (!res.ok) die(`Ollama ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const raw = data.response || ''
  log(`Ollama odpowiedź (${raw.length} znaków)`)
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    const m = raw.match(/\{[\s\S]*\}/)
    if (!m) die(`Ollama nie zwrócił JSON: ${raw.slice(0, 300)}`)
    parsed = JSON.parse(m[0])
  }
  if (!parsed.title || !parsed.body || !parsed.tag) {
    die(`Brakuje pól: ${JSON.stringify(parsed)}`)
  }
  if (!ALLOWED_TAGS.includes(parsed.tag)) {
    log(`Tag "${parsed.tag}" spoza listy — fallback na "build"`)
    parsed.tag = 'build'
  }
  return parsed
}

async function gitRun(args) {
  const { stdout, stderr } = await execFileP('git', args, { cwd: ROOT })
  if (stderr) log(`git ${args[0]} stderr:`, stderr.trim())
  return stdout.trim()
}

async function main() {
  const date = todayPL()
  log(`Daily-now start dla ${date}`)

  const nowData = JSON.parse(await fs.readFile(NOW_PATH, 'utf8'))
  const existing = nowData.items.find((it) => it.date === date && it.auto === true)
  if (existing) {
    log(`Wpis auto:true z ${date} już istnieje — skip. Title: "${existing.title}"`)
    return
  }

  const sessions = await readSessions(date)
  if (sessions.length === 0) {
    log(`Brak sesji z dnia ${date} — kończę bez zmian.`)
    return
  }

  const digest = sessions.map(condense).join('\n\n')
  const entry = await callOllama(digest)
  entry.date = date
  entry.auto = true

  nowData.items.unshift({ date: entry.date, title: entry.title, body: entry.body, tag: entry.tag, auto: true })
  await fs.writeFile(NOW_PATH, JSON.stringify(nowData, null, 2) + '\n', 'utf8')
  log(`Dopisano do now.json: "${entry.title}" [${entry.tag}]`)

  // Git commit + push
  await gitRun(['add', 'content/now.json'])
  const status = await gitRun(['status', '--porcelain', 'content/now.json'])
  if (!status) {
    log('Plik nie zmieniony (idempotent run?) — nie commituję.')
    return
  }
  await gitRun(['commit', '-m', `now: auto-update ${date} — ${entry.title}`])
  await gitRun(['push', 'origin', 'HEAD'])
  log(`✓ Commit + push zrobione. Vercel powinien zredeployować w 1-2 min.`)
}

main().catch((e) => die(e.stack || e.message))
