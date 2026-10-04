import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_ORIGIN, lastmodForUrl } from "./scripts/discovery.mjs";

function sitemapXmlAlias() {
  return {
    name: "sitemap-xml-alias",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        await copyFile(
          path.join(dist, "sitemap-index.xml"),
          path.join(dist, "sitemap.xml")
        );
        logger.info("Copied sitemap-index.xml to sitemap.xml");
      },
    },
  };
}

export default defineConfig({
  site: "https://ojaashampiholi.github.io",
  base: "/the-cosmic-notebook",
  output: "static",
  integrations: [
    sitemap({
      customPages: [`${SITE_ORIGIN}/rss.xml`],
      serialize(item) {
        if (/\/archives\/\d+\/?$/.test(item.url)) {
          return undefined;
        }

        if (/\.xml\/$/.test(item.url)) {
          item.url = item.url.replace(/\/$/, "");
        }

        const lastmod = lastmodForUrl(item.url);

        if (lastmod) {
          item.lastmod = lastmod;
        }

        return item;
      },
    }),
    sitemapXmlAlias(),
  ],
});