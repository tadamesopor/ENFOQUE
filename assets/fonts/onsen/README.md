# Custom fonts

Drop your font files here (`.woff2` preferred, `.ttf`/`.otf` also work), then:

1. Open `css/styles.css` and find the `@font-face` block near the top (in the
   "Hero name: easy font + colour knobs" section). Uncomment it and point the
   `src:` at your file, e.g.:

   ```css
   @font-face {
     font-family: "Hero Custom";
     src: url("../assets/fonts/my-hero-font.woff2") format("woff2");
     font-weight: 400 800;
     font-display: swap;
   }
   ```

   (The path is relative to `css/styles.css`, so `../assets/fonts/…`.)

2. Right below it, set the hero font to your new family:

   ```css
   :root {
     --hero-font: "Hero Custom", sans-serif;
   }
   ```

That's it — only the hero name uses `--hero-font`. To restyle other text the
same way, give it a `font-family: var(--your-var)` rule in `css/styles.css`.

> Tip: convert `.ttf`/`.otf` to `.woff2` (e.g. https://cloudconvert.com/ttf-to-woff2)
> for much smaller files and faster loading.
