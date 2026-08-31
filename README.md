# Orbital Notes

A static Astro blog for astronomy and physics posts stored as JSON.

## Add a post

1. Copy `src/content/posts/earth-heliosphere.json` to a new descriptive filename.
2. Update the JSON fields. Its filename becomes the post URL: `posts/your-filename/`.
3. Commit and push to `main`; GitHub Pages rebuilds the site automatically.

## Publish on GitHub Pages

1. Create a GitHub repository and upload this project.
2. In `astro.config.mjs`, replace `YOUR-GITHUB-USERNAME` and `YOUR-REPOSITORY-NAME`.
3. In GitHub, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.

For a user site named `<username>.github.io`, change `base` in `astro.config.mjs` to `''`.
