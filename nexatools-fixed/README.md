# NexaTools

A static, responsive utility website with 50 browser-based tools across seven hubs.

## Run locally

From this folder, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. Run through a local server rather than opening the HTML files directly, because the homepage and tools directory load `tools.json` with `fetch()`.

## Project structure

- `index.html` — homepage
- `tools.html` — searchable, filterable directory of all 50 tools
- `*.html` — individual utility and information pages
- `assets/css/` — shared and page-specific stylesheets
- `assets/js/` — tool logic, directory behaviour, search and weather features
- `tools.json` — directory data used by the homepage and tools page
- `favicon.svg` — NexaTools brand icon

## Implementation notes

- The website uses a light forest-green and lime visual system.
- Font Awesome 6.7.2 is loaded from cdnjs for consistent interface icons.
- Many tools run locally in the browser. The weather checker uses Open-Meteo geocoding and forecast endpoints.
- PDF and QR features load their supporting libraries from CDNs and require an internet connection.
- The text summarizer, rewriter and grammar checker are lightweight local utilities, not generative AI services.
- No database or account system is required by this static build.

## Before publishing

1. Confirm the production domain, then add canonical URLs and generate a sitemap containing absolute production URLs. The current build intentionally omits canonical URLs and the sitemap because the real domain has not been supplied.
2. Monitor `mathsolverpro1@gmail.com` for support requests and keep access to that inbox secure.
3. Add the exact Google AdSense publisher record to `ads.txt` only after approval, and only if advertising is enabled.
4. Review `privacy.html` against the final hosting, analytics, cookie and advertising configuration. The policy currently describes the source configuration reviewed for this update; revise it if you enable new services.
5. Test the website on desktop and mobile, including PDF, QR, image and weather tools.

## Important tool limitations

Some results depend on the values entered, browser support, external library availability or external data providers. Users should verify important results, particularly where institutional grading rules, financial decisions or document requirements apply.
