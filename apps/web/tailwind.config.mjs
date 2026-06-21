/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: '#262626',
        'pure-paper': '#ffffff',
        'soft-mist': '#ededed',
        charcoal: '#171717',
        ash: '#686868',
        slate: '#515151',
        muted: '#737373',
        fog: '#929292',
        chalk: '#cbcbcb',
        'mint-whisper': '#ecfdf5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        buttons: '4px',
      },
      backgroundImage: {
        'hero-pattern': "url('/Background.png')",
      },
    },
  },
  plugins: [],
};
