// Tailwind v4 ships its own Vite plugin (@tailwindcss/vite) and does not require
// a PostCSS pipeline for the build. This file exists for tooling that still
// expects a PostCSS config (Stylelint, IDEs). The Vite plugin handles
// compilation; we only declare autoprefixer here as a defensive baseline.
export default {
  plugins: {
    autoprefixer: {},
  },
};
