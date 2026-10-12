# Family Memories Design — familymemoriesdesign.com

On-site tournament apparel printing — "printed while you wait".

**Live site:** WordPress theme **Family Memories Design — Wear Memories** (v2.0.5).

## What's here

```
theme/fmd-wear-memories/        the live theme — exact copy of what's running
  front-page.php                one-page layout (template parts in order)
  template-parts/               hero, studio, designs, process, pricing, directors, booth, book, faq
  inc/                          customizer, designs post type, booking handler
  assets/                       css, js, img, 3d models (.glb)
releases/                       packaged zips, ready to upload via wp-admin
```

## Install / update on WordPress

1. wp-admin → Appearance → Themes → Add New → Upload Theme → choose `releases/fmd-wear-memories-2.0.5.zip` → Install → **Replace current with uploaded**.
2. Appearance → Customize → Site Identity → Logo → upload the original `logo2x.png` (logo is never redrawn — always composite the real file).
3. Appearance → Customize → **Wear Memories**: hero text, prices, booth photo, 3D models, booking email.

Step-by-step in Russian: `theme/fmd-wear-memories/readme.txt`.

## Rebuilding the theme

The theme is built from the Vite source (local workspace) with the packaging
script that rewrites asset paths, generates `index.php`, and bumps the version
in `style.css`. To cut a new release: rebuild, repackage, drop the new zip in
`releases/`, and update the `Version:` line in `theme/fmd-wear-memories/style.css`.

## History

Before 2026-10-07 this repo held a standalone static (React/Vite) version of
the site. It was superseded by the WordPress theme, which is what's live now.
The old files are preserved in git history.
