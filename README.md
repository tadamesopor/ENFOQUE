# ENFOQUE — Personal Portfolio

A personal showcase portfolio for **Damian Mattheeuw**, built to present my work, creative
style and front-end development skills through a cool interface. It
doubles as a playground for scroll-driven animation, custom cursor work and interactive image
effects.

## Deployment

This is a static site there is no build step. Serve the folder with any static server.

For local development (e.g. the VS Code **Live Server** extension, or):

```bash
  npx serve .
```

Then open the printed `localhost` URL.

To deploy, push the folder to any static host (GitHub Pages, Netlify, Vercel, …).

> **Note:** the mobile gyroscope parallax relies on the `deviceorientation` API, which browsers
> only expose over **HTTPS** (or `localhost`). On a deployed site make sure it is served over https.

## Tech stack

- HTML5
- Tailwind CSS (Play CDN)
- Vanilla JavaScript
- GSAP — ScrollSmoother & ScrollTrigger
- WebGL (background shader)

## Features

### Homepage

**Editorial hero**
A large, layered hero with a letter-by-letter intro animation, a live location/date/time bar
and a portrait the headline overlaps.

**Cursor image trail**
Moving the cursor across the hero scatters photos that pop in and fade out, with the spawn rate
driven by cursor speed.

**Gyroscope parallax (mobile)**
On phones the hero layers drift with the device tilt instead of the cursor, using the gyroscope.

**Smooth scrolling & scroll-spy nav**
GSAP ScrollSmoother powers the smooth scroll, and the nav highlights the section you are
currently viewing.

**Selected work**
Project cards that link through to dedicated case-study pages, with hover zoom and lightweight
autoplay video previews.

**About**
A bold editorial statement beside a second block of text, with an image that travels a diagonal
path and changes through several shots as you scroll.

**Skills**
An auto-scrolling marquee that reverses with scroll direction, above a grid of cards that invert
with an expanding-circle reveal from the cursor.

**Off-work photography**
A pinned, horizontally-scrolling gallery of personal photography (cats / objects / people) that
pans as you scroll on desktop and stacks on mobile.

**Atmosphere**
A custom blend-mode cursor, a WebGL background shader and a subtle film-grain / scanline overlay.

### Project pages

**Case-study layout**
Each project (Owen Bryce, Owow Dashboard, Serieus?!) has its own page with a hero, overview,
metadata, a media gallery and a chained "next project" link back into the work loop.

### General

**Fully responsive**
Layouts collapse for mobile, with a dedicated full-screen mobile menu and reduced spacing.

**Reduced-motion aware**
Heavy animations respect `prefers-reduced-motion` and touch devices.

## Demo

The site is best experienced live. Add your deployed URL here once it is hosted:

```
https://enfoque-mocha.vercel.app/ 
```

## Environment Variables

This is a static front-end project and needs **no runtime environment variables**.

The only local config is `.mcp.json` (git-ignored), which holds the API key for the **Google
Stitch** MCP integration used during the design phase. It is not required to run the site —
contact the owner of the repository if you need those details.
