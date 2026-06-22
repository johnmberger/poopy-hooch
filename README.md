# Shoot the Hooch?

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

## Deploy

Deploy to any static host (Vercel, Netlify, GitHub Pages). The page is fully static — bacteria data is fetched directly from USGS in the browser on each visit.

## Data source

- [USGS NWIS instantaneous values API](https://waterservices.usgs.gov/) — fetched client-side (parameter codes 99407 and 63680)
- Same data shown on [ga.water.usgs.gov/bacteria](https://ga.water.usgs.gov/bacteria/)
- River geometry from [OpenStreetMap](https://www.openstreetmap.org/) (stored in `data/chattahoochee-river.json`)

Data is provisional and model-estimated. Always use your own judgment and check official advisories before getting on the river.
