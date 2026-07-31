# Jekyll blog

This directory contains the blog-specific source files.

```text
blog/
├── index.html                    # blog archive page
├── ko/                           # Korean archive and folder pages
├── _layouts/                    # shared HTML frames
├── _posts/                      # Markdown posts
└── assets/css/style.css         # blog-only design
```

The repository-level `_config.yml` tells Jekyll where these files live. The
rest of the portfolio remains regular static HTML.

## Add a post

1. Copy an existing file in `_posts/`.
2. Name it `YYYY-MM-DD-short-title.md`.
3. Edit the information between the two `---` lines.
4. Write the article below the second `---` using Markdown.
5. Commit and push. GitHub Pages runs Jekyll and publishes the generated page.

Example:

```markdown
---
title: My new note
description: One sentence shown on the archive page.
lang: en
categories:
  - Cosmology
---

Write the post here.
```

Do not manually add the post to `blog/index.html`; its list is generated from
the files in `_posts/`.

Use one of these folder names in `categories`: `Cosmology`, `Machine Learning`,
`Generative Model`, or `Python`.

Set `lang: en` for an English post or `lang: ko` for a Korean post. English
posts appear at `/blog/`; Korean posts appear at `/blog/ko/`.

## Preview locally

Jekyll needs a current Ruby installation. After Ruby is ready, run these from
the repository root:

```sh
bundle install
bundle exec jekyll serve
```

Then open `http://127.0.0.1:4000/blog/`. Stop the preview with `Ctrl+C`.

The macOS system Ruby in this workspace is version 2.6 and is too old for the
current dependency set. Update Ruby with a version manager before using the
local preview commands; this does not prevent GitHub Pages from building the
site after a push.
