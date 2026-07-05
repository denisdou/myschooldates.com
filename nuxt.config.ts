export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content'],

  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true },
  },

  nitro: {
    prerender: {
      routes: [
        '/sitemap.xml',

        // ── State pages ────────────────────────────────────────────────────────
        '/california',
        '/florida',
        '/texas',
        '/north-carolina',
        '/virginia',

        // ── District index pages ───────────────────────────────────────────────
        '/austin-independent-school-district-calendar',
        '/broward-county-school-calendar',
        '/charlotte-mecklenburg-schools-calendar',
        '/chesterfield-county-school-calendar',
        '/cumberland-county-school-calendar',
        '/dallas-independent-school-district-calendar',
        '/fairfax-county-school-calendar',
        '/fort-worth-independent-school-district-calendar',
        '/fresno-unified-school-district-calendar',
        '/guilford-county-school-calendar',
        '/hillsborough-county-school-calendar',
        '/houston-independent-school-district-calendar',
        '/long-beach-unified-school-district-calendar',
        '/los-angeles-unified-school-district-calendar',
        '/loudoun-county-school-calendar',
        '/miami-dade-school-calendar',
        '/northside-independent-school-district-calendar',
        '/orange-county-school-calendar',
        '/palm-beach-county-school-calendar',
        '/prince-william-county-school-calendar',
        '/sacramento-city-unified-school-calendar',
        '/san-diego-unified-school-district-calendar',
        '/virginia-beach-school-calendar',
        '/wake-county-school-calendar',
        '/winston-salem-forsyth-school-calendar',

        // ── District year pages ────────────────────────────────────────────────
        '/austin-independent-school-district-calendar/2025-2026',
        '/austin-independent-school-district-calendar/2026-2027',

        '/broward-county-school-calendar/2025-2026',
        '/broward-county-school-calendar/2026-2027',
        '/broward-county-school-calendar/2027-2028',

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

        '/fairfax-county-school-calendar/2025-2026',
        '/fairfax-county-school-calendar/2026-2027',
        '/fairfax-county-school-calendar/2027-2028',

        '/fort-worth-independent-school-district-calendar/2025-2026',
        '/fort-worth-independent-school-district-calendar/2026-2027',

        '/fresno-unified-school-district-calendar/2025-2026',
        '/fresno-unified-school-district-calendar/2026-2027',
        '/fresno-unified-school-district-calendar/2027-2028',

        '/guilford-county-school-calendar/2025-2026',
        '/guilford-county-school-calendar/2026-2027',
        '/guilford-county-school-calendar/2027-2028',

        '/hillsborough-county-school-calendar/2025-2026',
        '/hillsborough-county-school-calendar/2026-2027',

        '/houston-independent-school-district-calendar/2025-2026',
        '/houston-independent-school-district-calendar/2026-2027',

        '/long-beach-unified-school-district-calendar/2025-2026',
        '/long-beach-unified-school-district-calendar/2026-2027',
        '/long-beach-unified-school-district-calendar/2027-2028',

        '/los-angeles-unified-school-district-calendar/2025-2026',
        '/los-angeles-unified-school-district-calendar/2026-2027',
        '/los-angeles-unified-school-district-calendar/2027-2028',

        '/loudoun-county-school-calendar/2025-2026',
        '/loudoun-county-school-calendar/2026-2027',
        '/loudoun-county-school-calendar/2027-2028',

        '/miami-dade-school-calendar/2025-2026',
        '/miami-dade-school-calendar/2026-2027',

        '/northside-independent-school-district-calendar/2025-2026',
        '/northside-independent-school-district-calendar/2026-2027',
        '/northside-independent-school-district-calendar/2027-2028',

        '/orange-county-school-calendar/2025-2026',
        '/orange-county-school-calendar/2026-2027',

        '/palm-beach-county-school-calendar/2025-2026',
        '/palm-beach-county-school-calendar/2026-2027',

        '/prince-william-county-school-calendar/2025-2026',
        '/prince-william-county-school-calendar/2026-2027',

        '/sacramento-city-unified-school-calendar/2025-2026',
        '/sacramento-city-unified-school-calendar/2026-2027',

        '/san-diego-unified-school-district-calendar/2025-2026',
        '/san-diego-unified-school-district-calendar/2026-2027',

        '/virginia-beach-school-calendar/2025-2026',
        '/virginia-beach-school-calendar/2026-2027',

        '/wake-county-school-calendar/2025-2026',
        '/wake-county-school-calendar/2026-2027',
        '/wake-county-school-calendar/2027-2028',

        '/winston-salem-forsyth-school-calendar/2025-2026',
        '/winston-salem-forsyth-school-calendar/2026-2027',
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