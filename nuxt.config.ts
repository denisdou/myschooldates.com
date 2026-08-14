import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type DistrictRouteRecord = {
  institutionId?: string
  slug?: string
}

type CalendarRouteRecord = {
  schoolYear?: string
}

type StateRouteRecord = {
  stateSlug?: string
}

function readContentJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function getCalendarPrerenderRoutes() {
  const root = process.cwd()
  const districtsDir = join(root, 'content', 'districts')
  const calendarsDir = join(root, 'content', 'calendars')
  const slugByInstitutionId = new Map<string, string>()
  const institutionIdBySlug = new Map<string, string>()
  const routes = new Set<string>()

  for (const file of readdirSync(districtsDir).filter(file => file.endsWith('.json')).sort()) {
    const district = readContentJson<DistrictRouteRecord>(join(districtsDir, file))
    if (!district.institutionId || !district.slug) {
      throw new Error(`District content is missing institutionId or slug: ${file}`)
    }
    if (slugByInstitutionId.has(district.institutionId)) {
      throw new Error(`Duplicate district institutionId: ${district.institutionId}`)
    }
    if (institutionIdBySlug.has(district.slug)) {
      throw new Error(`Duplicate district slug: ${district.slug}`)
    }

    slugByInstitutionId.set(district.institutionId, district.slug)
    institutionIdBySlug.set(district.slug, district.institutionId)
    routes.add(`/${district.slug}`)
  }

  const institutionDirectories = readdirSync(calendarsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const institutionDirectory of institutionDirectories) {
    const institutionId = institutionDirectory.name
    const slug = slugByInstitutionId.get(institutionId)
    if (!slug) {
      throw new Error(`Calendar directory has no matching district content: ${institutionId}`)
    }

    const institutionDir = join(calendarsDir, institutionId)
    for (const file of readdirSync(institutionDir).filter(file => file.endsWith('.json')).sort()) {
      const calendar = readContentJson<CalendarRouteRecord>(join(institutionDir, file))
      if (!calendar.schoolYear) {
        throw new Error(`Calendar content is missing schoolYear: ${institutionId}/${file}`)
      }
      routes.add(`/${slug}/${calendar.schoolYear}`)
    }
  }

  return [...routes].sort()
}

const calendarPrerenderRoutes = getCalendarPrerenderRoutes()

function getStatePrerenderRoutes() {
  const statesDir = join(process.cwd(), 'content', 'states')
  const stateSlugs = new Set<string>()

  for (const file of readdirSync(statesDir).filter(file => file.endsWith('.json')).sort()) {
    const state = readContentJson<StateRouteRecord>(join(statesDir, file))
    if (!state.stateSlug) {
      throw new Error(`State content is missing stateSlug: ${file}`)
    }
    if (stateSlugs.has(state.stateSlug)) {
      throw new Error(`Duplicate state slug: ${state.stateSlug}`)
    }
    stateSlugs.add(state.stateSlug)
  }

  return [...stateSlugs].sort().map(stateSlug => `/${stateSlug}`)
}

const statePrerenderRoutes = getStatePrerenderRoutes()

const googleAnalyticsScripts = process.env.NODE_ENV === 'production'
  ? [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-X3KKMXLR1B',
        async: true,
        tagPosition: 'bodyClose' as const,
      },
      {
        innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-X3KKMXLR1B');`,
        tagPosition: 'bodyClose' as const,
      },
    ]
  : []

const googleAdsenseMeta = process.env.NODE_ENV === 'production'
  ? [{ name: 'google-adsense-account', content: 'ca-pub-3343469861997938' }]
  : []

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  sourcemap: false,

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content'],
  css: ['~/assets/css/main.css'],

  content: {
    _localDatabase: {
      type: 'sqlite',
      filename: '/tmp/myschooldates-content-local.sqlite',
    },
    database: {
      type: 'sqlite',
      filename: '/tmp/myschooldates-content.sqlite',
    },
  },

  vite: {
    build: {
      sourcemap: false,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true },
  },

  nitro: {
    sourceMap: false,
    prerender: {
      crawlLinks: false,
      autoSubfolderIndex: false,
      routes: [
        '/sitemap.xml',

        // ── Editorial and data pages ───────────────────────────────────────────
        '/blog',
        '/author',
        '/data-license',
        '/school-calendar-trends/2026-2027-report',
        '/school-calendar-trends',
        '/datasets/school-calendar-trends',
        '/school-start-dates-2026',
        '/winter-break-2026',
        '/spring-break-2027',
        '/summer-break-2027',
        '/districts',

        // State routes are generated from verified content files.
        ...statePrerenderRoutes,

        // District and school-year routes are generated from verified content files.
        ...calendarPrerenderRoutes,
      ],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      script: googleAnalyticsScripts,
      link: [
        // Favicon — SVG first (modern browsers), then PNG fallbacks
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/favicon-48.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/favicon-16.png' },
        // Apple
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon-180.png' },
        // Android / PWA
        { rel: 'manifest', href: '/manifest.json' },
      ],
      meta: [
        ...googleAdsenseMeta,
        { name: 'google-site-verification', content: 'kQNKHnW5SBoo5rpzlwnTxGzfeDdeLgG5c5zGN5IoepU' },
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#ffffff' },
        // Default OG (overridden per-page via useSeoMeta)
        { property: 'og:site_name', content: 'MySchoolDates' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://myschooldates.com/icons/myschooldates-og-img.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'MySchoolDates — US Public School Calendar Platform' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://myschooldates.com/icons/myschooldates-twitter-image.png' },
        { name: 'twitter:site', content: '@myschooldates' },
      ],
    },
  },
})
