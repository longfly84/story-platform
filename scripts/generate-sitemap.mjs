import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load stories from src/data/stories.ts by importing compiled file
// We use dynamic import to evaluate TypeScript-compiled JS when running via node
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function loadStories() {
  // resolve project root
  const projectRoot = path.resolve(__dirname, '..')
  // import the source file via ts-node is not available; instead read JS built output if present
  const src = path.resolve(projectRoot, 'src/data/stories.ts')
  if (!fs.existsSync(src)) throw new Error('src/data/stories.ts not found')
  // crude parse: extract slugs and chapters by regex to avoid compiling TS
  const txt = fs.readFileSync(src, 'utf-8')
  const storyBlocks = txt.split(/export const stories:\s*Story\[]\s*=\s*\[/)[1]
  if (!storyBlocks) return []
  // very loose regex to capture story objects inside the stories array only
  const storyEntries = storyBlocks.match(/\{[\s\S]*?id:\s*"[^"]+"[\s\S]*?\}[,\s]*/g)
  if (!storyEntries) return []
  return storyEntries.map((entry) => {
    const slugMatch = entry.match(/slug:\s*"([^"]+)"/)
    // collect chapter slugs appearing literally or using chapterSlug(n)
    const chapterMatches = Array.from(entry.matchAll(/slug:\s*chapterSlug\((\d+)\)|slug:\s*"(chuong-[0-9]+)"/g))
    const storySlug = slugMatch ? slugMatch[1] : undefined
    const chapters = chapterMatches.map((m) => {
      return m[1] ? `chuong-${m[1]}` : m[2]
    }).filter(Boolean)
    return { slug: storySlug, chapters }
  }).filter(s => s.slug)
}

function makeUrl(host, p) {
  return `${host}${p}`
}

async function generate() {
  const host = process.env.SITE_URL ?? 'https://story-platform-coral.vercel.app'
  const out = path.resolve(__dirname, '..', 'public', 'sitemap.xml')
  const stories = await loadStories()

  const urls = new Set()
  urls.add(makeUrl(host, '/'))
  for (const s of stories) {
    urls.add(makeUrl(host, `/truyen/${s.slug}`))
    if (s.chapters && s.chapters.length) {
      for (const c of s.chapters) {
        urls.add(makeUrl(host, `/doc-truyen/${s.slug}/${c}`))
      }
    }
  }

  const xml = [`<?xml version="1.0" encoding="UTF-8"?>`,`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`]
  for (const u of urls) {
    xml.push('  <url>')
    xml.push(`    <loc>${u}</loc>`)
    xml.push('  </url>')
  }
  xml.push('</urlset>')

  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, xml.join('\n'))
  console.log('sitemap written to', out)
}

generate().catch((e) => { console.error(e); process.exit(1) })
