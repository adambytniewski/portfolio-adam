import workData from '../content/work.json'
import nowData from '../content/now.json'
import skillsData from '../content/skills.json'
import profileData from '../content/profile.json'

export type Category =
  | 'video'
  | 'photo'
  | 'automation'
  | 'app'
  | 'website'
  | 'music'

export type WorkItem = {
  id: string
  category: Category
  title: string
  subtitle: string
  description: string
  tags: string[]
  stack: string[]
  date: string
  cover: string | null
  link: string | null
  featured: boolean
}

export type NowItem = {
  date: string
  title: string
  body: string
  tag: string
}

export type SkillGroup = { name: string; items: string[] }

export type Profile = {
  name: string
  handle: string
  tagline_pl: string
  tagline_lines: string[]
  intro: string
  email: string
  location: string
  available: boolean
  socials: { label: string; href: string }[]
}

export const work: WorkItem[] = (workData.items as WorkItem[]).slice().sort(
  (a, b) => +new Date(b.date) - +new Date(a.date),
)

export const now: NowItem[] = (nowData.items as NowItem[]).slice().sort(
  (a, b) => +new Date(b.date) - +new Date(a.date),
)

export const skills: SkillGroup[] = skillsData.groups
export const profile: Profile = profileData as Profile

export const CATEGORY_LABEL: Record<Category, string> = {
  video: 'Video',
  photo: 'Foto',
  automation: 'Automatyzacja',
  app: 'Aplikacja',
  website: 'Strona',
  music: 'Muzyka',
}

export const CATEGORY_ORDER: Category[] = [
  'app',
  'website',
  'automation',
  'video',
  'photo',
  'music',
]

export function formatDatePL(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
