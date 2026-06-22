/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    preflight: false,
  },
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
    },
  },
  plugins: [],
}
