# EVES — Website

Futuristic 3D landing page for EVES, built with React, Three.js, and GSAP.

## Development

```bash
cd website
npm install
npm run dev
```

Open `http://localhost:5173`

## Build for GitHub Pages

```bash
npm run build
```

Output is in `website/dist/`. Deploy to GitHub Pages by pushing the `dist/` contents to a `gh-pages` branch.

## Font File

The 3D text component uses a Helvetiker typeface JSON. Download it from:

```
https://threejs.org/examples/fonts/helvetiker_regular.typeface.json
```

Place it at `website/public/fonts/helvetiker_regular.typeface.json`.

## Tech Stack

- React 18 + TypeScript
- Three.js via @react-three/fiber + @react-three/drei
- GSAP ScrollTrigger
- Vite 5
- Tailwind CSS 3
