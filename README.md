# Is the 'Hooch Poopy?

A simple site that answers the most important question on a hot Atlanta day: **is it safe to float the Chattahoochee River?**

It pulls estimated E. coli levels from the [USGS BacteriALERT program](https://ga.water.usgs.gov/bacteria/) at three monitoring sites in the Chattahoochee River National Recreation Area:

| Site | Section |
|------|---------|
| Medlock Bridge | Upstream (Norcross / Duluth) |
| Powers Ferry | Middle (Sandy Springs / I-285) |
| Paces Ferry | Downstream (Atlanta / Vinings) |

Readings ≤ **235 cfu/100 mL** are considered low risk per EPA beach action values — the same threshold used on the BacteriALERT site.

## Contributing

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
git clone https://github.com/johnmberger/poopy-hooch.git
cd poopy-hooch
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Production build |
| `npm run lint` | Lint (requires ESLint setup) |

Pull requests run CI on GitHub: tests and build must pass.

## Data sources

- [USGS NWIS instantaneous values API](https://waterservices.usgs.gov/) — fetched server-side via `/api/bacteria` (cached 1 hour)
- Same data shown on [ga.water.usgs.gov/bacteria](https://ga.water.usgs.gov/bacteria/)
- River geometry from [OpenStreetMap](https://www.openstreetmap.org/) (stored in `data/chattahoochee-river.json`)

Data is provisional and model-estimated. Always use your own judgment and check official advisories before getting on the river.

## License

MIT — see [LICENSE](LICENSE).
