/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reference Image Soft Claymorphic Palette:
        // Background: Warm pastel blush aura (#FAF5F0 to #F5F2F9 to #EEF4FC)
        // Surfaces: Crisp pure white (#FFFFFF), subtle inner wells (#F8FAFD)
        // Typography: Deep dark navy (#1E2046), soft slate (#7C8BA0, #9CA8BC)
        // Accents: Vibrant Coral Orange (#FF6B35, #F97316), Electric Blue (#3B5BFD), Teal (#06B6D4), Mint (#10B981), Amber (#F59E0B), Violet (#8B5CF6)
        background: '#F8F9FD',
        primary: {
          navy: '#1E2046',
          slate: '#7C8BA0',
          muted: '#9CA8BC',
          dark: '#121430',
        },
        coral: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          glow: 'rgba(255, 107, 53, 0.25)',
          50: '#FFF5F0',
          100: '#FFE8DC',
          500: '#FF6B35',
          600: '#F0581F',
        },
        surface: {
          card: '#FFFFFF',
          panel: '#FFFFFF',
          subtle: '#F8FAFD',
          hover: '#F1F5FB',
          border: '#E9EEF5',
          inner: '#F4F7FB',
        },
        brand: {
          blue: '#3B5BFD',
          coral: '#FF6B35',
          cyan: '#06B6D4',
          mint: '#10B981',
          amber: '#F59E0B',
          violet: '#8B5CF6',
        },
        status: {
          match: '#10B981',
          matchBg: '#ECFDF5',
          mismatch: '#EF4444',
          mismatchBg: '#FEF2F2',
          warning: '#F59E0B',
          warningBg: '#FFFBEB',
          datagap: '#8B5CF6',
          datagapBg: '#F5F3FF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'clay': '0 12px 35px -8px rgba(125, 138, 168, 0.12), 0 4px 12px -2px rgba(125, 138, 168, 0.06)',
        'clay-hover': '0 20px 40px -10px rgba(125, 138, 168, 0.20), 0 6px 16px -2px rgba(125, 138, 168, 0.08)',
        'dock': '0 15px 45px -5px rgba(110, 125, 160, 0.14), 0 0 2px rgba(110, 125, 160, 0.2)',
        'pill': '0 2px 8px rgba(140, 155, 180, 0.12)',
        'glow-coral': '0 10px 25px -4px rgba(255, 107, 53, 0.35)',
        'glow-blue': '0 10px 25px -4px rgba(59, 91, 253, 0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}
