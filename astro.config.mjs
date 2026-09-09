import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://ojaashampiholi.github.io",
  base: "/the-cosmic-notebook",
  output: "static",
  integrations: [sitemap()],
});