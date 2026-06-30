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
  runtimeConfig: {
    public: { ciRunUrl: "" },
  },
  vite: {
    // The official SQLite WASM build resolves its .wasm via `import.meta.url`;
    // excluding it from dep pre-bundling keeps that resolution intact.
    optimizeDeps: { exclude: ["@sqlite.org/sqlite-wasm"] },
  },
});
