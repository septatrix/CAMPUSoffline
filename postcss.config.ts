import type { Config } from "postcss-load-config";
import type { Options as UrlOptions } from "postcss-url";

export default {
  plugins: {
    "postcss-plugin": [
      { filter: "**/assets/icons/*.svg", url: "inline" },
    ] satisfies UrlOptions | UrlOptions[],
  },
} satisfies Config;
