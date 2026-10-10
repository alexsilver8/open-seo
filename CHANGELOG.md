# Changelog

All notable changes to OpenSEO. Versions follow [Semantic Versioning](https://semver.org).

## [0.2.0](https://github.com/alexsilver8/openseo/compare/v0.1.0...v0.2.0) (2026-10-10)


### Features

* publish a docker image and add a demo to the readme ([#4](https://github.com/alexsilver8/openseo/issues/4)) ([06fa6e1](https://github.com/alexsilver8/openseo/commit/06fa6e1177d4f85bb896fa59ee9577676230d733))

## 0.1.0

The first release.

### Audits

- Grades a page from A+ to F with about 70 checks in seven categories: on-page SEO,
  performance, usability, security, links, social and AI search readiness.
- Ranks what to fix by priority, with a recommendation and evidence for every problem.
- Checks links live, measures scripts, stylesheets and images, and reads robots.txt, the
  sitemap, llms.txt, the SSL certificate, HTTP/2 support and SPF and DMARC records.
- Optional Core Web Vitals, accessibility score and phone and desktop screenshots from Google
  PageSpeed Insights.
- Refuses private and internal addresses, with timeouts, size limits and a per-visitor rate
  limit.

### Reports

- Shareable report pages with a category sidebar, a "fix these first" list and filters for
  problems and passes.
- Save as PDF from the browser, or download as JSON.
- White-label branding: name, logo, accent color, footer and a call to action button.
- A light theme by default, with dark and match-system options in Settings.

### Crawler

- Crawls up to 500 pages of a site, respecting robots.txt.
- Finds broken pages, links to broken pages, missing or duplicate titles and descriptions,
  missing or extra H1s, thin content, slow pages, noindex, canonicals and missing alt text.
- Site health score, issue filters and CSV export.

### Leads and embed

- One script tag puts the audit on any website, in your branding, resizing itself.
- Captures each visitor's email and website as a lead, with CSV export.

### Running it

- History of every audit with each site's score over time.
- REST API with streamed progress, and `pnpm scan` and `pnpm crawl` in the terminal.
- Data stored as JSON files. Optional admin password. Docker image and Compose file.
- Fonts are bundled with the app, so neither builds nor visitors call Google Fonts.
