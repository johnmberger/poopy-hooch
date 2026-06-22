# Is the 'Hooch Poopy?

A simple site that answers the most important question on a hot Atlanta day: **is it safe to float the Chattahoochee?**

It pulls estimated E. coli levels from the [USGS BacteriALERT program](https://ga.water.usgs.gov/bacteria/) at three monitoring sites in the Chattahoochee River National Recreation Area:

| Site | Section |
|------|---------|
| Medlock Bridge | Upstream (Norcross / Duluth) |
| Powers Ferry | Middle (Sandy Springs / I-285) |
| Paces Ferry | Downstream (Atlanta / Vinings) |

Readings ≤ **235 cfu/100 mL** are considered low risk per EPA beach action values — the same threshold used on the BacteriALERT site.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://isthehoochpoopy.com`) for correct canonical URLs, sitemap, and Open Graph tags.

## Deploy

Deploy to Vercel or any Node host. The `/api/bacteria` route fetches USGS once per hour and caches the response at the edge; all users share the same cached data.

## Data source

- [USGS NWIS instantaneous values API](https://waterservices.usgs.gov/) — fetched server-side via `/api/bacteria` (cached 1 hour)
- Same data shown on [ga.water.usgs.gov/bacteria](https://ga.water.usgs.gov/bacteria/)
- River geometry from [OpenStreetMap](https://www.openstreetmap.org/) (stored in `data/chattahoochee-river.json`)

Data is provisional and model-estimated. Always use your own judgment and check official advisories before getting on the river.
