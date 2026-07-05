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
      routes: ['/sitemap.xml'],
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