/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#FFFFFF', secondary: '#F7F8FC', elevated: '#FFFFFF' },
        border: { subtle: '#E6E8F0' },
        accent: {
          primary: '#5B6EF5',
          secondary: '#16C79A',
          tertiary: '#9B5CF6',
          warm: '#F5A623',
        },
        text: { primary: '#14151F', secondary: '#5C6178', muted: '#9498AC' },
        status: { success: '#16C79A', warning: '#F5A623', danger: '#EF4D5C' },
      },
      fontFamily: {
        display: ['Syne', 'Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        hero: 'clamp(2.5rem, 6vw, 4.5rem)',
      },
      borderRadius: {
        sm: '8px', md: '12px', lg: '16px', xl: '24px', pill: '999px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(20,21,31,0.04), 0 1px 2px rgba(20,21,31,0.03)',
        'card-hover': '0 12px 32px rgba(20,21,31,0.08)',
        'glow-primary': '0 8px 30px rgba(91,110,245,0.25)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #5B6EF5 0%, #9B5CF6 50%, #16C79A 100%)',
        'gradient-glow': 'radial-gradient(circle at 50% 0%, rgba(91,110,245,0.12), transparent 60%)',
        'gradient-card': 'linear-gradient(180deg, rgba(91,110,245,0.04) 0%, rgba(255,255,255,0) 100%)',
      },
    },
  },
  plugins: [],
};
