module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  safelist: [
    'bg-rojo-btn', 'text-white',
    'bg-amarillo-btn', 'bg-azul-btn', 'bg-verde-btn'
  ],
  // ...otros settings


  content: [
    "./src/**/*.{html,js,ts,tsx}", // Ajusta según tu estructura
  ],
  theme: {
    extend: {
      fontFamily: {
        helveticaMedium: ['HelveticaMedium', 'sans-serif'],
      },
      fontSize: {
        '12': '12px',
      },
    },
  },
  plugins: [],


}