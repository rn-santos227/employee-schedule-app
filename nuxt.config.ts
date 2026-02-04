// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  components: [
    {
      path: resolve('./components'),
      pathPrefix: false
    }
  ],

  css: [
    '~/assets/css/main.css'
  ]
})
