import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler((event) => {
  const baseUrl = 'https://myschooldates.com'
  const root = process.cwd()

  interface SitemapUrl {
    loc: string
    priority: string
    changefreq: string
    lastmod?: string
  }

  // ── Districts ──────────────────────────────────────────────────────────────
  const districtDir = join(root, 'content', 'districts')
  const districtData: Array<{ institutionId: string; slug: string; currentSchoolYear: string }> = []

  for (const file of readdirSync(districtDir)) {
    if (!file.endsWith('.json')) continue
    const d = JSON.parse(readFileSync(join(districtDir, file), 'utf-8'))
    districtData.push({ institutionId: d.institutionId, slug: d.slug, currentSchoolYear: d.currentSchoolYear })
  }

  const idToDistrict = Object.fromEntries(districtData.map(d => [d.institutionId, d]))

  // ── School-year pages ──────────────────────────────────────────────────────
  const calendarsDir = join(root, 'content', 'calendars')
  const calendarUrls: SitemapUrl[] = []
  const hubLastmodByInstitutionId = new Map<string, string>()

  for (const institutionId of readdirSync(calendarsDir)) {
    const distPath = join(calendarsDir, institutionId)
    const district = idToDistrict[institutionId]
    if (!district) continue

    for (const file of readdirSync(distPath)) {
      if (!file.endsWith('.json')) continue
      const cal = JSON.parse(readFileSync(join(distPath, file), 'utf-8'))
      const lastmod = cal.dateModified ?? cal.lastVerifiedAt
      if (lastmod && lastmod > (hubLastmodByInstitutionId.get(institutionId) ?? '')) {
        hubLastmodByInstitutionId.set(institutionId, lastmod)
      }
      const isCurrentYear = cal.schoolYear === district.currentSchoolYear
      const isUpcomingYear = cal.schoolYear > district.currentSchoolYear
      if (isCurrentYear || isUpcomingYear) {
        calendarUrls.push({
          loc: `${baseUrl}/${district.slug}/${cal.schoolYear}`,
          priority: isCurrentYear ? '0.9' : '0.6',
          changefreq: 'monthly',
          ...(lastmod ? { lastmod } : {}),
        })
      }
    }
  }

  // ── States ─────────────────────────────────────────────────────────────────
  const stateDir = join(root, 'content', 'states')
  const stateUrls: SitemapUrl[] = []

  for (const file of readdirSync(stateDir)) {
    if (!file.endsWith('.json')) continue
    const s = JSON.parse(readFileSync(join(stateDir, file), 'utf-8'))
    const lastmod = s.dateModified ?? s.lastVerifiedAt
    stateUrls.push({
      loc: `${baseUrl}/${s.stateSlug}`,
      priority: '0.8',
      changefreq: 'monthly',
      ...(lastmod ? { lastmod } : {}),
    })
  }

  // ── Build URL list ─────────────────────────────────────────────────────────
  const urls: SitemapUrl[] = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/blog`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/author`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/school-calendar-trends/2026-2027-report`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/school-calendar-trends`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/datasets/school-calendar-trends`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/school-start-dates-2026`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/winter-break-2026`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/spring-break-2027`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/summer-break-2027`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/districts`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/calendar-verification-methodology`, priority: '0.6', changefreq: 'monthly' },
    ...stateUrls,
    ...districtData.map(d => ({
      loc: `${baseUrl}/${d.slug}`,
      priority: '0.6',
      changefreq: 'yearly',
      ...(hubLastmodByInstitutionId.get(d.institutionId)
        ? { lastmod: hubLastmodByInstitutionId.get(d.institutionId) }
        : {}),
    })),
    ...calendarUrls,
  ]

  // ── Render XML ─────────────────────────────────────────────────────────────
  const urlNodes = urls.map(({ loc, priority, changefreq, lastmod }) =>
    `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlNodes}\n</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
