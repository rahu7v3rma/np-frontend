const { nextui, Button } = require('@nextui-org/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      width: {
        17: '74px',
        '3/16': '18%',
        343: '343px',
        320: '330px',
        159: '159px',
        118: '118px',
        86: '344px',
        90: '360px',
      },
      height: {
        '6-1': '22px',
        240: '240px',
        54: '54px',
        36: '36px',
      },
      minWidth: {
        50: '200px',
      },
      maxWidth: {
        960: '960px',
      },
      minWidth: {
        343: '343px',
      },
      minHeight: {
        1024: '1024px',
      },
      boxShadow: {
        't-lg':
          '0px 12px 24px -4px rgba(145, 158, 171, 0.12),0px 0px 2px 0px rgba(145, 158, 171, 0.2)',
        's-lg':
          '-20px 20px 40px -4px rgba(145,158,171,0.24), 0px 0px 2px 0px rgba(145,158,171,0.24)',
        't-lg':
          '0px 12px 24px -4px rgba(145, 158, 171, 0.12),0px 0px 2px 0px rgba(145, 158, 171, 0.2)',
        't-lg-1':
          '0px 12px 24px -4px rgba(145, 158, 171, 0.12), 0px 0px 2px 0px rgba(145, 158, 171, 0.2)',
      },
      colors: {
        'table-head': '#F6F6F6',
        'orange-111': 'rgba(250, 159, 86, 0.16)',
        'orange-112': 'rgba(224, 103, 5, 1)',
        'text-secondary': 'rgba(134, 135, 136, 1)',
        'text-primary': 'rgba(54, 56, 57, 1)',
        'border-color-1': 'var(--grey-8, rgba(189, 189, 189, 0.08))',
        'extra-cost-background-1': '#FEF0E4',
        'extra-cost-background-2': '#FA9F5629',
        'extra-cost-text-color': '#E06705',
        alert: '#FF5630',
        'button-background-1': '#BDBDBD33',
        'button-text-color-1': '#919EAB99',
        'category-default': '#868788',
        'category-selected': '#363839',
        'discount': '#79A18A',
        'discount-light': '#E5F9EE',
        emerald: {
          300: '#79A18A',
        },
        'avatar-background': '#D6DFFF',
        'avatar-text': '#56618D',
      },
      fontFamily: {
        assistant: ['var(--font-assistant)'],
        sans: ['var(--font-sans)'],
      },
      fontSize: {
        'xs-1': '13px',
        'xs-2': '10px',
      },
      lineHeight: {
        '5-1': '18px',
        '5-2': '22px',
      },
      spacing: {
        '0-3': '3px',
        '3-1': '13px',
      },
      boxShadow: {
        dropdown:
          '-20px 20px 40px -4px rgba(145, 158, 171, 0.24), 0px 0px 2px 0px rgba(145, 158, 171, 0.24)',
        popup: '-20px 20px 40px -4px #919EAB3D, 0px 0px 2px 0px #919EAB3D',
      },
    },
  },
  plugins: [
    nextui({
      layout: {
        fontSize: {
          tiny: '0.75rem',
          small: '0.875rem',
          medium: '1rem',
        },
        radius: {
          medium: '8px',
          large: '10px',
        },
        disabledOpacity: '0.2',
      },
      themes: {
        light: {
          colors: {
            primary: {
              foreground: '#FFF',
              DEFAULT: '#363839',
              100: '#868788',
            },
            secondary: {
              DEFAULT: '#FA9F56',
            },
          },
        },
      },
    }),
  ],
};
