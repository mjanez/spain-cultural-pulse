# Spain - Cultural Pulse
[![ES](https://img.shields.io/badge/lang-ES-yellow.svg)](README.md)
[![EN](https://img.shields.io/badge/lang-EN-blue.svg)](README.en.md)

Interactive webapp to explore culture, values, and politics in contemporary Spain through visualizations powered by open data.

- **[View Demo](https://mjanez.github.io/spain-cultural-pulse)**

## About

Web application built with Next.js that enables analysis and visualization of cultural and social patterns in Spain. Data comes from a representative survey of 3,000 Spanish adults conducted in 2024.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Visualization:** Recharts / D3.js
- **Styling:** Tailwind CSS
- **Deployment:** [GitHub Pages](#deployment)/Vercel

## Data Source

Based on the [Study on Social Norms in Politics, 2024](https://datos.gob.es/es/catalogo/ea0020951-estudio-sobre-normas-sociales-en-la-politica-2024) by CSIC.

>**Sample:** 3,000 Spanish adults (online survey, June 2024)  
>**Panel:** Netquest  
>**Representative by:** gender, age, education, region, and municipality size

## License

This project is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE). You are free to use, share, and adapt this work as long as you provide appropriate attribution.

## What it covers

- **Culture & leisure:** music, sports, food and fashion preferences
- **Mobility:** transport habits and travel patterns
- **Personal values:** love, sexuality and relationships
- **Political attitudes:** equality, immigration, environment and gender
- **Politics:** ideological orientation, voting intention and polarization

## Installation

```bash
npm install
npm run dev
```

## Deployment

The project automatically deploys to GitHub Pages via GitHub Actions when pushing to the `main` branch.

**Required setup:**
1. Go to Settings → Pages on GitHub
2. Source: GitHub Actions
3. Site will be available at: `https://[username].github.io/spain-cultural-pulse`

**Manual deploy:**
```bash
npm run build
```

