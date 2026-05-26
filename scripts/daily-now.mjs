#!/usr/bin/env node
/**
 * Daily Now-feed updater — automatyczny wpis o 18:00 (day) i 03:00 (night).
 *
 * 1. Czyta pliki z SecondBrain\Sessions\YYYY-MM-DD-*.md (z dziś lub z wczoraj po 18:00).
 * 2. Wycina TL;DR + Streszczenie + Decyzje z każdej sesji.
 * 3. Pyta Claude Code CLI (`claude -p` przez stdin) o wpis w formacie JSON.
 * 4. Dopisuje {title, body, tag, auto:true [+late:true]} do content/now.json.
 * 5. git add → commit → push (Vercel sam zredeployuje).
 *
 * Idempotencja per-tryb: skip jeśli wpis day/night dla daty już istnieje.
 *
 * Tryb manualny:    `npm run daily-now`            (dzienny)
 *                   `node scripts/daily-now.mjs --night`  (nocny)
 * Tryb scheduled:   scripts/daily-now.ps1 (18:00) / daily-now-night.ps1 (03:00)
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile, spawn } from 'node:child_process'
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
const CLAUDE_CMD = process.env.CLAUDE_CMD || 'claude'
const ALLOWED_TAGS = ['skill', 'tooling', 'automation', 'build', 'ai-video', 'music']

const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a)
const die = (msg, code = 1) => {
  console.error(`[${new Date().toISOString()}] FATAL:`, msg)
  process.exit(code)
}

const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const todayPL = () => fmtDate(new Date())
const yesterdayPL = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return fmtDate(d)
}

// CLI mode: --night odpala drugi przebieg o 03:00 dla sesji wczorajszych po 18:00
const MODE = process.argv.includes('--night') ? 'night' : 'day'

async function readSessions(dateStr, minHHMM = null) {
  let entries
  try {
    entries = await fs.readdir(SESSIONS_DIR)
  } catch (e) {
    die(`Nie mogę odczytać ${SESSIONS_DIR}: ${e.message}`)
  }
  let todays = entries.filter((f) => f.startsWith(`${dateStr}-`) && f.endsWith('.md'))
  // Format pliku: YYYY-MM-DD-HHMM-slug.md → filtruj po HHMM jeśli ustawione
  if (minHHMM !== null) {
    todays = todays.filter((f) => {
      const m = f.match(/^\d{4}-\d{2}-\d{2}-(\d{4})-/)
      return m && m[1] >= minHHMM
    })
    log(`Znaleziono ${todays.length} sesji z dnia ${dateStr} po godzinie ${minHHMM.slice(0, 2)}:${minHHMM.slice(2)}`)
  } else {
    log(`Znaleziono ${todays.length} sesji z dnia ${dateStr}`)
  }
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

const PROMPT_SYSTEM = `Jesteś edytorem strony-portfolio Adama Bytniewskiego (redmind.pl). Strona promuje pracę z AI — automatyzacje, buildy, narzędzia, tooling, skill-stack, video AI, music AI. Sekcja "Now / Aktualne realizacje" jest dziennikiem pracy aktualizowanym 2× dziennie.

Z poniższych sesji wybierz JEDNĄ rzecz najciekawszą, najbardziej związaną z AI/automatyzacją/buildem, którą można pokazać publicznie. Pomijaj prywatne (gotowanie, rodzina, zakupy, terapie). Pomijaj rzeczy banalne (drobne fixy, debug bez wartości narracyjnej).

Wpis MUSI:
- mieć tytuł po polsku, zwięzły (max 70 znaków), bez kropki na końcu
- mieć body 1-3 zdania po polsku, plastyczny język techniczny, bez emoji, bez markdownu, bez code-fence
- mieć tag z listy: skill, tooling, automation, build, ai-video, music
- nie zawierać dat ("dziś", "wczoraj") w body — data jest osobnym polem

ZWRÓĆ WYŁĄCZNIE JEDEN JSON: {"title": "...", "body": "...", "tag": "..."}.
Bez komentarzy. Bez markdown. Bez \`\`\`. Bez chain-of-thought. Sam JSON, jeden obiekt.`

function spawnP(cmd, args, stdinText, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { ...opts, stdio: ['pipe', 'pipe', 'pipe'] })
    let stdout = '', stderr = ''
    p.stdout.on('data', (d) => (stdout += d.toString('utf8')))
    p.stderr.on('data', (d) => (stderr += d.toString('utf8')))
    p.on('error', reject)
    p.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(`${cmd} exit ${code}: ${stderr || stdout}`))
    })
    if (stdinText) p.stdin.write(stdinText)
    p.stdin.end()
  })
}

async function callClaude(digest) {
  const prompt = `${PROMPT_SYSTEM}\n\n=== SESJE Z DRUGIEGO MÓZGU ===\n${digest}\n=== KONIEC SESJI ===\n\nJSON:`
  log(`Wywołuję Claude Code CLI (${prompt.length} znaków promptu)`)
  const { stdout } = await spawnP(CLAUDE_CMD, ['-p'], prompt)
  log(`Claude odpowiedź (${stdout.length} znaków)`)
  // Wytnij pierwszy JSON object — Claude czasem dodaje preambułę typu "Oto JSON:"
  const m = stdout.match(/\{[\s\S]*?"title"[\s\S]*?"tag"[\s\S]*?\}/m)
  if (!m) die(`Claude nie zwrócił JSON. Output: ${stdout.slice(0, 500)}`)
  let parsed
  try {
    parsed = JSON.parse(m[0])
  } catch (e) {
    die(`JSON parse error: ${e.message}. Raw: ${m[0].slice(0, 300)}`)
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
  // Wybór daty zależnie od trybu:
  // - day (default, 18:00): bieżący dzień, wszystkie sesje
  // - night (03:00): wczorajszy dzień, tylko sesje po 18:00 (czyli to co po pierwszym auto-runie)
  const isNight = MODE === 'night'
  const date = isNight ? yesterdayPL() : todayPL()
  const minHHMM = isNight ? '1800' : null
  log(`Daily-now start [mode=${MODE}] dla ${date}${minHHMM ? ` (sesje po ${minHHMM})` : ''}`)

  const nowData = JSON.parse(await fs.readFile(NOW_PATH, 'utf8'))

  // Idempotencja per-tryb:
  // - day: szukaj wpisu auto:true bez late:true
  // - night: szukaj wpisu auto:true z late:true
  const existing = nowData.items.find((it) => {
    if (it.date !== date || it.auto !== true) return false
    return isNight ? it.late === true : it.late !== true
  })
  if (existing) {
    log(`Wpis ${isNight ? 'nocny (late)' : 'dzienny'} z ${date} już istnieje — skip. Title: "${existing.title}"`)
    return
  }

  const sessions = await readSessions(date, minHHMM)
  if (sessions.length === 0) {
    log(`Brak sesji dla tego trybu — kończę bez zmian.`)
    return
  }

  const digest = sessions.map(condense).join('\n\n')
  const entry = await callClaude(digest)
  entry.date = date
  entry.auto = true

  const itemToAdd = { date: entry.date, title: entry.title, body: entry.body, tag: entry.tag, auto: true }
  if (isNight) itemToAdd.late = true
  nowData.items.unshift(itemToAdd)
  await fs.writeFile(NOW_PATH, JSON.stringify(nowData, null, 2) + '\n', 'utf8')
  log(`Dopisano do now.json: "${entry.title}" [${entry.tag}]${isNight ? ' (late)' : ''}`)

  // Git commit + push
  await gitRun(['add', 'content/now.json'])
  const status = await gitRun(['status', '--porcelain', 'content/now.json'])
  if (!status) {
    log('Plik nie zmieniony (idempotent run?) — nie commituję.')
    return
  }
  const commitMsg = `now: ${isNight ? 'night' : 'auto'}-update ${date} — ${entry.title}`
  await gitRun(['commit', '-m', commitMsg])
  await gitRun(['push', 'origin', 'HEAD'])
  log(`✓ Commit + push zrobione. Vercel powinien zredeployować w 1-2 min.`)
}

main().catch((e) => die(e.stack || e.message))
