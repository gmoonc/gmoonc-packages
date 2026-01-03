/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores Primárias da Goalmoon
        'goalmoon': {
          'navy': '#374161',      // Deep Navy/Space Blue - Fundos e elementos principais
          'slate': '#293047',     // Dark Slate - Fundos secundários
          'blue': '#6374AD',      // Azul médio - Botões e links
          'light-blue': '#879FED', // Azul claro - Elementos interativos
          'blue-gray': '#3F4A6E',  // Azul acinzentado - Destaques e acentos
        },
        // Cores Secundárias e de Destaque
        'accent': {
          'mint': '#71b399',      // Verde Menta - CTAs e estados de foco
          'light-gray': '#dbe2ea', // Cinza claro com tom azulado
          'off-white': '#eaf0f5',  // Branco off-white
          'beige': '#E6E0D3',      // Beige claro
          'cream': '#E2DBCD',      // Beige mais escuro
        },
        // Tons terrosos (uso moderado)
        'earth': {
          'brown': '#562632',
          'gray': '#856968',
          'cream-light': '#FCF7E4',
          'dark': '#29212C',
          'navy-dark': '#192639',
        }
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
        'montserrat-bold': ['Montserrat', 'sans-serif'],
      },
      fontWeight: {
        'bold': '700',
        'regular': '400',
      }
    },
  },
  plugins: [],
}
