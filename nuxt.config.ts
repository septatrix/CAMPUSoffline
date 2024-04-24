// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    },
  },
  features: { inlineStyles: false },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
});
