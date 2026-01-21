/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./types.ts",
    "./constants.ts",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Custom Zinc-based palette for "Shades of Grey"
        gray: {
          50: '#fafafa',   // Main App BG (Light)
          100: '#f4f4f5',  // Secondary BG
          150: '#edeff2',  // Borders/Hover
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',  // Muted Text
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',  // Card BG (Dark)
          900: '#18181b',  // Main App BG (Dark) - User requested
          950: '#0d0d0f',  // Deep Dark - User requested
        }
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(5px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: [],
}