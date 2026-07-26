# Zona Noman — Portfolio

A personal portfolio site for data science / data analytics roles. Plain HTML, CSS, and
JavaScript — no build step, no frameworks, no dependencies to install. Open `index.html` and
it works.

**Live site:** https://zona-n.github.io/Portfolio/ *(after you enable GitHub Pages — see below)*

---

## What's in here

```
index.html                     all the page content lives here
css/styles.css                 all the styling
js/main.js                     all the interactivity
assets/bitmoji.svg             ← PLACEHOLDER avatar. Swap this for your photo.
assets/favicon.svg             the little icon in the browser tab
assets/Zona-Noman-Resume.pdf   the résumé people download
```

---

## The three things you'll probably want to change

### 1. Replace the placeholder avatar with your real photo

The face on the homepage is a stand-in illustration. To use a real photo:

1. Save your photo into the `assets` folder as `profile.jpg`
   (a portrait-shaped photo works best — taller than it is wide).
2. Open `index.html`, find this line (near the top, in the hero section):

   ```html
   <img src="assets/bitmoji.svg" alt="Illustrated avatar of Zona Noman" class="portrait-card__img" id="avatarImg" />
   ```

3. Change `assets/bitmoji.svg` to `assets/profile.jpg` and update the alt text:

   ```html
   <img src="assets/profile.jpg" alt="Zona Noman" class="portrait-card__img" id="avatarImg" />
   ```

That's it — the frame, the animated scan line, and the layout all keep working.

### 2. Update the résumé

Drop a new PDF into `assets/` named `Zona-Noman-Resume.pdf`, replacing the old one. Every
"Download résumé" button already points there.

### 3. Change any text

All the words are in `index.html`. Search for the sentence you want to change and edit it
directly — nothing is generated or hidden anywhere else.

To add a **new project card**, copy any existing `<article class="card" ...>` block inside
`<div class="grid" id="projectGrid">` and edit it. The `data-cat` attribute controls which
filter buttons it shows up under — pick from `ml`, `data`, `app`, `a11y` (you can list more
than one, space-separated).

---

## Putting it online with GitHub Pages (free)

Everything is already pushed to this repo. To turn on the website:

1. Go to https://github.com/Zona-n/Portfolio
2. Click **Settings** (top row of tabs)
3. In the left sidebar click **Pages**
4. Under "Build and deployment" → Source, choose **Deploy from a branch**
5. Branch: **main**, folder: **/ (root)** → click **Save**
6. Wait about a minute, then refresh. Your site will be at:

   **https://zona-n.github.io/Portfolio/**

Every time you push a change to `main`, the site updates itself within a minute or two.

### Want a custom domain later?

Buy a domain (Namecheap, Porkbun, Cloudflare — usually ~$10/year), then add it under
Settings → Pages → Custom domain. GitHub walks you through the DNS records.

---

## Editing it locally

You don't need a terminal. Just open `index.html` by double-clicking it — it opens in your
browser and everything works, including the live GitHub feed.

If you do want a local server:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

---

## Features worth knowing about

- **Dark / light mode** — the moon/sun button in the nav. It remembers your choice.
- **Command palette** — press `⌘K` (Mac) or `Ctrl+K` (Windows) anywhere on the page to jump
  to a section or open a project. Engineers who look at your site will notice this.
- **Live GitHub feed** — the "Straight from GitHub" section pulls your six most recently
  pushed repos from the GitHub API in real time. Push a new repo and it shows up on the site
  automatically, no edits needed. If GitHub's API is rate-limited it quietly falls back to a
  hard-coded list in `js/main.js`.
- **Animated charts** — the visuals next to Brickonaut and iHEATRISK are hand-written SVG that
  animates in on scroll. The numbers live in the `data-h` / `data-w` attributes in `index.html`.
- **Responsive** — checked down to 390px wide (iPhone) and up to desktop.
- **Respects `prefers-reduced-motion`** — animations turn off for people who ask their OS for
  less motion.
- **Works without JavaScript** — content still renders, just without the animations.

---

## Colors, if you want to change the look

Every color is defined once at the top of `css/styles.css`, in the `:root` block for dark mode
and `html[data-theme="light"]` for light mode. Change `--accent` (currently violet) and the
whole site follows — buttons, links, charts, the hero animation, all of it.
