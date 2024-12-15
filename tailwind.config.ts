import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  darkMode: ['class'],

  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],

  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      dropShadow: {
        custom: '1px 2px 10px rgba(0, 0, 0, 0.35)',
      },
      colors: {
        text: '#000000',
        accent2: '#366b58',
        gray: '#6b7280',
        logo: '#d1f6ee',
        border: '#9CA3AF',
        input: '#9CA3AF',
        ring: '#E5EBF5',
        background: '#FFFFFF',
        foreground: '#000000',
        dark_text: '#ffffff',
        dark_gray: '#9ca3af',
        dark_primary: '#96BBCA',
        dark_border: '#355B6A',
        dark_accent: '#0A101A',
        dark_secondary: '#355B6A',
        dark_background: '#0F1A2B',
        chat: '#29455d',
        primary: {
          DEFAULT: '#355B6A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#1D2F50',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#CA3D3D',
          foreground: '#FFFFFF',
        },
        constructive: {
          DEFAULT: '#228B22',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F3F2',
          foreground: '#2F2A28',
        },
        accent: {
          DEFAULT: '#d2d9e4',
          foreground: '#FFFFFF',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B0909',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0B0909',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        skeleton: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        in: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        out: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        skeleton: 'skeleton 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        fadeIn: 'fadeIn 0.5s alternate',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        in: 'in 0.3s ease-out',
        out: 'out 0.3s ease-out',
      },
    },
    plugins: [nextui(), require('tailwindcss-animate')],
  },
};

export default config;
