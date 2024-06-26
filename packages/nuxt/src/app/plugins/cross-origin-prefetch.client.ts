import { ref } from 'vue'
import { parseURL } from 'ufo'
import { useHead } from '@unhead/vue'
import { defineNuxtPlugin } from '../nuxt'

export default defineNuxtPlugin({
  name: 'nuxt:cross-origin-prefetch',
  setup (nuxtApp) {
    const externalURLs = ref(new Set<string>())
    function generateRules () {
      return {
        type: 'speculationrules',
        key: 'speculationrules',
        innerHTML: JSON.stringify({
          prefetch: [
            {
              source: 'list',
              urls: [...externalURLs.value],
              requires: ['anonymous-client-ip-when-cross-origin'],
            },
          ],
        }),
      }
    }
    const head = useHead({
      script: [generateRules()],
    })
    nuxtApp.hook('link:prefetch', (url) => {
      const { protocol } = parseURL(url)
      if (protocol && ['http:', 'https:'].includes(protocol)) {
        externalURLs.value.add(url)
        head?.patch({
          script: [generateRules()],
        })
      }
    })
  },
})
