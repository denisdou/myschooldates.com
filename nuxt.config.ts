export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  sourcemap: false,

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content'],

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
      autoSubfolderIndex: false,
      routes: [
        '/sitemap.xml',

        // ── State pages ────────────────────────────────────────────────────────
        '/california',
        '/florida',
        '/texas',
        '/north-carolina',
        '/virginia',
        '/kentucky',

        // ── District index pages ───────────────────────────────────────────────
        '/aldine-independent-school-district-calendar',
        '/austin-independent-school-district-calendar',
        '/broward-county-school-calendar',
        '/brunswick-county-schools-calendar',
        '/charlotte-mecklenburg-schools-calendar',
        '/chesterfield-county-school-calendar',
        '/cumberland-county-school-calendar',
        '/dallas-independent-school-district-calendar',
        '/duval-county-school-calendar',
        '/fairfax-county-school-calendar',
        '/fort-worth-independent-school-district-calendar',
        '/fresno-unified-school-district-calendar',
        '/garland-independent-school-district-calendar',
        '/garden-grove-unified-school-district-calendar',
        '/guilford-county-school-calendar',
        '/hampton-city-schools-calendar',
        '/hillsborough-county-school-calendar',
        '/houston-independent-school-district-calendar',
        '/humble-isd-calendar',
        '/long-beach-unified-school-district-calendar',
        '/los-angeles-unified-school-district-calendar',
        '/lewisville-independent-school-district-calendar',
        '/klein-isd-calendar',
        '/loudoun-county-school-calendar',
        '/mansfield-isd-calendar',
        '/miami-dade-school-calendar',
        '/mckinney-isd-calendar',
        '/newport-news-public-schools-calendar',
        '/northside-independent-school-district-calendar',
        '/orange-county-school-calendar',
        '/palm-beach-county-school-calendar',
        '/pasco-county-school-calendar',
        '/pasadena-independent-school-district-calendar',
        '/pinellas-county-school-calendar',
        '/polk-county-school-calendar',
        '/prince-william-county-school-calendar',
        '/randolph-county-school-system-calendar',
        '/spring-isd-calendar',
        '/riverside-unified-school-district-calendar',
        '/roanoke-county-public-schools-calendar',
        '/sacramento-city-unified-school-calendar',
        '/santa-ana-unified-school-district-calendar',
        '/san-bernardino-city-unified-school-district-calendar',
        '/san-francisco-unified-school-district-calendar',
        '/san-jose-unified-school-calendar',
        '/stockton-unified-school-district-calendar',
        '/oakland-unified-school-district-calendar',
        '/irvine-unified-school-district-calendar',
        '/iredell-statesville-schools-calendar',
        '/lee-county-school-calendar',
        '/san-diego-unified-school-district-calendar',
        '/virginia-beach-school-calendar',
        '/wake-county-school-calendar',
        '/williamsburg-james-city-county-schools-calendar',
        '/york-county-school-division-calendar',
        '/winston-salem-forsyth-school-calendar',
        '/plano-independent-school-district-calendar',
        '/henrico-county-school-calendar',
        '/henderson-county-schools-ky-calendar',
        '/henderson-county-public-schools-calendar',
        '/frisco-independent-school-district-calendar',
        '/union-county-school-calendar',
        '/cabarrus-county-school-calendar',
        '/catawba-county-schools-calendar',
        '/johnston-county-school-calendar',
        '/durham-public-schools-calendar',
        '/new-hanover-county-school-calendar',
        '/arlington-public-schools-calendar',
        '/alexandria-city-public-schools-calendar',
        '/stafford-county-public-schools-calendar',
        '/spotsylvania-county-public-schools-calendar',
        '/cypress-fairbanks-isd-calendar',
        '/elk-grove-unified-school-district-calendar',

        // ── District year pages ────────────────────────────────────────────────
        '/aldine-independent-school-district-calendar/2025-2026',
        '/aldine-independent-school-district-calendar/2026-2027',

        '/austin-independent-school-district-calendar/2025-2026',
        '/austin-independent-school-district-calendar/2026-2027',

        '/broward-county-school-calendar/2025-2026',
        '/broward-county-school-calendar/2026-2027',
        '/broward-county-school-calendar/2027-2028',

        '/brunswick-county-schools-calendar/2025-2026',
        '/brunswick-county-schools-calendar/2026-2027',
        '/brunswick-county-schools-calendar/2027-2028',

        '/charlotte-mecklenburg-schools-calendar/2025-2026',
        '/charlotte-mecklenburg-schools-calendar/2026-2027',
        '/charlotte-mecklenburg-schools-calendar/2027-2028',

        '/chesterfield-county-school-calendar/2025-2026',
        '/chesterfield-county-school-calendar/2026-2027',
        '/chesterfield-county-school-calendar/2027-2028',

        '/cumberland-county-school-calendar/2025-2026',
        '/cumberland-county-school-calendar/2026-2027',

        '/dallas-independent-school-district-calendar/2025-2026',
        '/dallas-independent-school-district-calendar/2026-2027',

        '/duval-county-school-calendar/2025-2026',
        '/duval-county-school-calendar/2026-2027',

        '/fairfax-county-school-calendar/2025-2026',
        '/fairfax-county-school-calendar/2026-2027',
        '/fairfax-county-school-calendar/2027-2028',

        '/fort-worth-independent-school-district-calendar/2025-2026',
        '/fort-worth-independent-school-district-calendar/2026-2027',

        '/fresno-unified-school-district-calendar/2025-2026',
        '/fresno-unified-school-district-calendar/2026-2027',
        '/fresno-unified-school-district-calendar/2027-2028',

        '/garland-independent-school-district-calendar/2025-2026',
        '/garland-independent-school-district-calendar/2026-2027',
        '/garland-independent-school-district-calendar/2027-2028',

        '/garden-grove-unified-school-district-calendar/2025-2026',
        '/garden-grove-unified-school-district-calendar/2026-2027',

        '/guilford-county-school-calendar/2025-2026',
        '/guilford-county-school-calendar/2026-2027',
        '/guilford-county-school-calendar/2027-2028',

        '/hampton-city-schools-calendar/2025-2026',
        '/hampton-city-schools-calendar/2026-2027',

        '/hillsborough-county-school-calendar/2025-2026',
        '/hillsborough-county-school-calendar/2026-2027',

        '/houston-independent-school-district-calendar/2025-2026',
        '/houston-independent-school-district-calendar/2026-2027',

        '/long-beach-unified-school-district-calendar/2025-2026',
        '/long-beach-unified-school-district-calendar/2026-2027',

        '/los-angeles-unified-school-district-calendar/2025-2026',
        '/los-angeles-unified-school-district-calendar/2026-2027',
        '/los-angeles-unified-school-district-calendar/2027-2028',

        '/lewisville-independent-school-district-calendar/2025-2026',
        '/lewisville-independent-school-district-calendar/2026-2027',

        '/loudoun-county-school-calendar/2025-2026',
        '/loudoun-county-school-calendar/2026-2027',
        '/loudoun-county-school-calendar/2027-2028',

        '/miami-dade-school-calendar/2025-2026',
        '/miami-dade-school-calendar/2026-2027',

        '/newport-news-public-schools-calendar/2025-2026',
        '/newport-news-public-schools-calendar/2026-2027',

        '/northside-independent-school-district-calendar/2025-2026',
        '/northside-independent-school-district-calendar/2026-2027',
        '/northside-independent-school-district-calendar/2027-2028',

        '/orange-county-school-calendar/2025-2026',
        '/orange-county-school-calendar/2026-2027',

        '/palm-beach-county-school-calendar/2025-2026',
        '/palm-beach-county-school-calendar/2026-2027',

        '/pasco-county-school-calendar/2025-2026',
        '/pasco-county-school-calendar/2026-2027',

        '/pasadena-independent-school-district-calendar/2025-2026',
        '/pasadena-independent-school-district-calendar/2026-2027',

        '/pinellas-county-school-calendar/2025-2026',
        '/pinellas-county-school-calendar/2026-2027',

        '/polk-county-school-calendar/2025-2026',
        '/polk-county-school-calendar/2026-2027',
        '/polk-county-school-calendar/2027-2028',
        '/polk-county-school-calendar/2028-2029',

        '/lee-county-school-calendar/2025-2026',
        '/lee-county-school-calendar/2026-2027',
        '/lee-county-school-calendar/2027-2028',

        '/prince-william-county-school-calendar/2025-2026',
        '/prince-william-county-school-calendar/2026-2027',

        '/riverside-unified-school-district-calendar/2025-2026',
        '/riverside-unified-school-district-calendar/2026-2027',
        '/riverside-unified-school-district-calendar/2027-2028',
        '/riverside-unified-school-district-calendar/2028-2029',

        '/roanoke-county-public-schools-calendar/2025-2026',
        '/roanoke-county-public-schools-calendar/2026-2027',
        '/roanoke-county-public-schools-calendar/2027-2028',

        '/sacramento-city-unified-school-calendar/2025-2026',
        '/sacramento-city-unified-school-calendar/2026-2027',

        '/santa-ana-unified-school-district-calendar/2025-2026',
        '/santa-ana-unified-school-district-calendar/2026-2027',

        '/san-bernardino-city-unified-school-district-calendar/2025-2026',
        '/san-bernardino-city-unified-school-district-calendar/2026-2027',

        '/san-francisco-unified-school-district-calendar/2025-2026',
        '/san-francisco-unified-school-district-calendar/2026-2027',
        '/san-francisco-unified-school-district-calendar/2027-2028',

        '/san-jose-unified-school-calendar/2025-2026',
        '/san-jose-unified-school-calendar/2026-2027',
        '/san-jose-unified-school-calendar/2027-2028',

        '/stockton-unified-school-district-calendar/2025-2026',
        '/stockton-unified-school-district-calendar/2026-2027',

        '/oakland-unified-school-district-calendar/2025-2026',
        '/oakland-unified-school-district-calendar/2026-2027',
        '/oakland-unified-school-district-calendar/2027-2028',

        '/irvine-unified-school-district-calendar/2025-2026',
        '/irvine-unified-school-district-calendar/2026-2027',
        '/irvine-unified-school-district-calendar/2027-2028',

        '/iredell-statesville-schools-calendar/2025-2026',
        '/iredell-statesville-schools-calendar/2026-2027',

        '/san-diego-unified-school-district-calendar/2025-2026',
        '/san-diego-unified-school-district-calendar/2026-2027',

        '/virginia-beach-school-calendar/2025-2026',
        '/virginia-beach-school-calendar/2026-2027',

        '/wake-county-school-calendar/2025-2026',
        '/wake-county-school-calendar/2026-2027',
        '/wake-county-school-calendar/2027-2028',

        '/williamsburg-james-city-county-schools-calendar/2025-2026',
        '/williamsburg-james-city-county-schools-calendar/2026-2027',
        '/williamsburg-james-city-county-schools-calendar/2027-2028',

        '/york-county-school-division-calendar/2025-2026',
        '/york-county-school-division-calendar/2026-2027',

        '/winston-salem-forsyth-school-calendar/2025-2026',
        '/winston-salem-forsyth-school-calendar/2026-2027',

        '/plano-independent-school-district-calendar/2025-2026',
        '/plano-independent-school-district-calendar/2026-2027',
        '/plano-independent-school-district-calendar/2027-2028',

        '/henrico-county-school-calendar/2026-2027',
        '/henrico-county-school-calendar/2027-2028',

        '/henderson-county-schools-ky-calendar/2025-2026',
        '/henderson-county-schools-ky-calendar/2026-2027',

        '/henderson-county-public-schools-calendar/2025-2026',
        '/henderson-county-public-schools-calendar/2026-2027',
        '/henderson-county-public-schools-calendar/2027-2028',

        '/catawba-county-schools-calendar/2025-2026',
        '/catawba-county-schools-calendar/2026-2027',

        '/randolph-county-school-system-calendar/2025-2026',
        '/randolph-county-school-system-calendar/2026-2027',
        '/randolph-county-school-system-calendar/2027-2028',

        '/frisco-independent-school-district-calendar/2025-2026',
        '/frisco-independent-school-district-calendar/2026-2027',

        '/mckinney-isd-calendar/2025-2026',
        '/mckinney-isd-calendar/2026-2027',

        '/klein-isd-calendar/2025-2026',
        '/klein-isd-calendar/2026-2027',

        '/humble-isd-calendar/2025-2026',
        '/humble-isd-calendar/2026-2027',

        '/mansfield-isd-calendar/2025-2026',
        '/mansfield-isd-calendar/2026-2027',

        '/spring-isd-calendar/2025-2026',
        '/spring-isd-calendar/2026-2027',

        '/round-rock-independent-school-district-calendar',
        '/round-rock-independent-school-district-calendar/2025-2026',
        '/round-rock-independent-school-district-calendar/2026-2027',

        '/katy-independent-school-district-calendar',
        '/katy-independent-school-district-calendar/2025-2026',
        '/katy-independent-school-district-calendar/2026-2027',
        '/katy-independent-school-district-calendar/2027-2028',

        '/conroe-independent-school-district-calendar',
        '/conroe-independent-school-district-calendar/2025-2026',
        '/conroe-independent-school-district-calendar/2026-2027',

        '/union-county-school-calendar/2026-2027',
        '/union-county-school-calendar/2025-2026',
        '/union-county-school-calendar/2027-2028',

        '/cabarrus-county-school-calendar/2026-2027',
        '/cabarrus-county-school-calendar/2025-2026',

        '/johnston-county-school-calendar/2026-2027',
        '/johnston-county-school-calendar/2025-2026',

        '/durham-public-schools-calendar/2025-2026',
        '/durham-public-schools-calendar/2026-2027',
        '/durham-public-schools-calendar/2027-2028',

        '/new-hanover-county-school-calendar/2025-2026',
        '/new-hanover-county-school-calendar/2026-2027',

        '/arlington-public-schools-calendar/2025-2026',
        '/arlington-public-schools-calendar/2026-2027',

        '/alexandria-city-public-schools-calendar/2025-2026',
        '/alexandria-city-public-schools-calendar/2026-2027',

        '/stafford-county-public-schools-calendar/2025-2026',
        '/stafford-county-public-schools-calendar/2026-2027',

        '/spotsylvania-county-public-schools-calendar/2025-2026',
        '/spotsylvania-county-public-schools-calendar/2026-2027',
        '/spotsylvania-county-public-schools-calendar/2027-2028',

        '/cypress-fairbanks-isd-calendar/2025-2026',
        '/cypress-fairbanks-isd-calendar/2026-2027',

        '/elk-grove-unified-school-district-calendar/2025-2026',
        '/elk-grove-unified-school-district-calendar/2026-2027',
      ],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-X3KKMXLR1B',
          async: true,
          tagPosition: 'bodyClose',
        },
        {
          innerHTML: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-X3KKMXLR1B');`,
          tagPosition: 'bodyClose',
        },
      ],
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
