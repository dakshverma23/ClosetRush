/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "'Times New Roman'", "serif"],
        body:    ["'Lora'",            "Georgia", "'Times New Roman'", "serif"],
        sans:    ["'Lora'",            "Georgia", "serif"],
        serif:   ["'Playfair Display'","Georgia", "serif"],
      },
      colors: {
        // Luxury Blue Palette
        luxuryBlue: {
          50: "#f0f6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1e3a8a",
          800: "#172554",
          900: "#0f172a",
        },
        // Primary Blues (Modern Design System)
        primary: {
          900: '#0F172A',
          700: '#1E3A8A', 
          500: '#2563EB',
          300: '#93C5FD',
          // Keep legacy colors for compatibility
          50: '#e6f7ff',
          100: '#bae7ff',
          200: '#91d5ff',
          400: '#40a9ff',
          600: '#096dd9',
          800: '#003a8c',
        },
        // Accent Teal
        accent: {
          500: '#14B8A6',
          400: '#2DD4BF',
          300: '#5EEAD4',
        },
        // Neutral Backgrounds
        bg: {
          main: '#F8FAFC',
          surface: '#FFFFFF',
          elevated: '#F1F5F9',
        },
        // Text Colors
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          inverse: '#FFFFFF',
        },
        // CTA Colors
        cta: {
          primary: '#2563EB',
          hover: '#1D4ED8',
          accent: '#14B8A6',
        },
        // Keep secondary colors for compatibility
        secondary: {
          50: '#f6ffed',
          100: '#d9f7be',
          200: '#b7eb8f',
          300: '#95de64',
          400: '#73d13d',
          500: '#52c41a',
          600: '#389e0d',
          700: '#237804',
          800: '#135200',
          900: '#092b00',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)',
        'gradient-accent': 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(241,245,249,0.8) 100%)',
        'gradient-surface': 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)',
      },
      boxShadow: {
        'modern': '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.06)',
        'modern-lg': '0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
        'modern-xl': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 10px 10px -5px rgba(15, 23, 42, 0.04)',
        'glow-primary': '0 0 20px rgba(37, 99, 235, 0.3)',
        'glow-accent': '0 0 20px rgba(20, 184, 166, 0.3)',
      },
      borderRadius: {
        'modern': '16px',
        'modern-lg': '20px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(37, 99, 235, 0.5)' },
        }
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable Tailwind's base styles to avoid conflicts with Ant Design
  }
}
