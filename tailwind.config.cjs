const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  fontFamily: {
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    // serif: ['Merriweather', 'serif'],
    sans: 'Palanquin, Palanquin-fallback, sans-serif',
  },
  extend: {
    animation: {
      stretch: 'stretch 5s 3s ease-in-out infinite alternate',
    },
    keyframes: {
      stretch: {
        '0%': { left: '0' },
        'to': { left: '-50%' },
      }
    },
  },

  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        qrowdtheme: {
          "base-100": "#ffffff",
          "base-200": "#f4f5f6",
          "base-300": "#d9dbdf",
          "base-content": "#363b4e",  // tbh #333333 looks good here and as neutral with the colors, but we’ll use #363b4e to match the dashboard

          "neutral": "#363b4e",
          "neutral-content": "#ffffff",

          "primary": "#809aff", // blue
          "primary-focus": "#7088ed",
          "primary-content": "#ffffff",
          "secondary": "#e0e7ff", // light blue
          "secondary-focus": "#c7d2fe",
          "secondary-content": "#153ab3",
          "accent": "#2ee362",
          "accent-content": "#003810",

          "info": "#e7ed39",  // yellow
          "success": "#2de362", // ??
          "warning": "#ffb22c", // orange
          "error": "#ff3050", // red
        },
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],

          "base-100": "#2e3039",
          "base-200": "#1d1f25",
          "base-300": "#0d0e11",
          "base-content": "#c7c8cc",

          "neutral": "#3d4151",
          "neutral-content": "#c7c8cc",

          "primary": "#809aff",
          "primary-focus": "#7088ed",
          "primary-content": "#1d1f25",
          "secondary": "#899ef1", // secondary is unused
          "secondary-focus": "#778ce1",
          "secondary-content": "#1c1f24",
          "accent": "#2ee362",
          "accent-content": "#1c1f24",

          "info": "#e7ed39",
          "success": "#2de362",
          "warning": "#ffb22c",
          "error": "#ff3050",
        },
      },
      "dark",
      "cupcake",
    ],
  },
};

module.exports = config;