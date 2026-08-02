# Minje Park — Personal Website

Static personal website published with GitHub Pages.

## Structure

- `*.html` — site pages served directly by GitHub Pages
- `shared-theme.css` — shared visual theme adjustments
- `shared-nav-mobile.css` — shared mobile navigation styles
- `assets/images/` — images currently used by the website
- `assets/images/archive/` — retained images that are not currently displayed
- `assets/game/genesis/` — image dataset used by the GENESIS game
- `assets/css/` — page-specific stylesheets
- `assets/js/` — page-specific JavaScript
- `blog/` — self-contained Jekyll blog source, layouts, posts, and styles
- `_config.yml` — Jekyll settings (the rest of the portfolio stays static HTML)
- `documents/cv/` — CV source and generated PDF
- `documents/papers/` — paper sources, figures, references, and generated PDFs
- `documents/presentations/` — presentation sources and exported PDFs

## Main pages

- `index.html` — home
- `about.html` — biography and CV
- `research.html` — research projects
- `publications.html` — publications, talks, and posters
- `blog/` — Jekyll-generated notes archive
- `calendar.html` — browser-local calendar
- `game.html` — GENESIS image comparison game

## Document workflow

Editable sources and their generated files stay together whenever possible:

```text
documents/cv/Minje_Park_CV.tex
documents/cv/Minje_Park_CV.pdf

documents/papers/genesis/genesis.tex
documents/papers/genesis/genesis.pdf
```

When a PDF is replaced or renamed, update every corresponding link in the root HTML files.

## Local preview

Run a simple static server from the repository root, then open the printed local URL:

```sh
python3 -m http.server 8000
```

Calendar entries are stored in the visitor's browser with `localStorage`. Seed calendar data embedded in the page source is public when this repository is public.

## Copyright and credits

Written content and original media are © Minje Park and all rights are reserved
unless a file states otherwise. No general license has been granted for the
original website source code yet. See `NOTICE.md` for design references and
third-party acknowledgements.
