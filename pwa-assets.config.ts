import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/**
 * Generates the PWA icon set from the source logo:
 *   npm run pwa:generate
 *
 * Outputs to ./public: favicon-16/32/48, apple-touch-icon-180,
 * maskable-icon-512, pwa-192/256/512.
 */
export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/logo-source.svg'],
})
