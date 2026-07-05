import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  const baseUrl = 'https://myschooldates.com'
  const today = new Date().toISOString().slice(0, 10)
  const root = process.cwd()

  // ── Districts ──────────────────────────────────────────────────────────────
  const districtDir = join(root, 'content', 'districts')
  const districtData: Array<{ institutionId: string; slug: string; currentSchoolYear: string }> = []

  for (const file of readdirSync(districtDir)) {
    if (!file.endsWith('.json')) continue
    const d = JSON.parse(readFileSync(join(districtDir, file), 'utf-8'))
    districtData.push({ institutionId: d.institutionId, slug: d.slug, currentSchoolYear: d.currentSchoolYear })
  }

  const idToDistrict = Object.fromEntries(districtData.map(d => [d.institutionId, d]))

  // ── Archived year pages ────────────────────────────────────────────────────
  const calendarsDir = join(root, 'content', 'calendars')
  const archiveUrls: string[] = []

  for (const institutionId of readdirSync(calendarsDir)) {
    const distPath = join(calendarsDir, institutionId)
    const district = idToDistrict[institutionId]
    if (!district) continue

    for (const file of readdirSync(distPath)) {
      if (!file.endsWith('.json')) continue
      const cal = JSON.parse(readFileSync(join(distPath, file), 'utf-8'))
      if (cal.schoolYear !== district.currentSchoolYear) {
        archiveUrls.push(`${baseUrl}/${district.slug}/${cal.schoolYear}`)
      }
    }
  }

  // ── States ─────────────────────────────────────────────────────────────────
  const stateDir = join(root, 'content', 'states')
  const stateSlugs: string[] = []

  for (const file of readdirSync(stateDir)) {
    if (!file.endsWith('.json')) continue
    const s = JSON.parse(readFileSync(join(stateDir, file), 'utf-8'))
    stateSlugs.push(s.stateSlug)
  }

  // ── Build URL list ─────────────────────────────────────────────────────────
  interface SitemapUrl { loc: string; priority: string; changefreq: string }

  const urls: SitemapUrl[] = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    ...stateSlugs.map(s => ({ loc: `${baseUrl}/${s}`, priority: '0.8', changefreq: 'monthly' })),
    ...districtData.map(d => ({ loc: `${baseUrl}/${d.slug}`, priority: '0.9', changefreq: 'monthly' })),
    ...archiveUrls.map(u => ({ loc: u, priority: '0.5', changefreq: 'yearly' })),
  ]

  // ── Render XML ─────────────────────────────────────────────────────────────
  const urlNodes = urls.map(({ loc, priority, changefreq }) =>
    `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
