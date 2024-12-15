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
        background: '#e5ebf5',
        primary: '#96a8c9',
        secondary: '#b7c2d6',

        dark_text: '#c8c8c8',
        dark_background: '#0c0d24',
        dark_primary: '#15183b',
        dark_secondary: '#2f314b',

        gray: '#c8c8c8',
        accent: '#d79e00',
        accentRed: '#dd2814',
        accentGreen: '#28dd14',
        accentBlue: '#1428dd',
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
