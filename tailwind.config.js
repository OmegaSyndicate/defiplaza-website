const colors = require('tailwindcss/colors');
const defaultConfig = require('tailwindcss/defaultConfig');

module.exports = {
	mode: 'jit',
	content: ['src/**/*.njk', 'src/**/*.svg'],
	theme: {
		colors: {
			...colors,
			black: '#23211f',
		},
		fontFamily: {
			sans: ['NB_International_Pro', ...defaultConfig.theme.fontFamily.sans],
			serif: ['ivypresto-display', ...defaultConfig.theme.fontFamily.serif],
			...defaultConfig.theme.fontFamily.mono,
		},
		extend: {
			colors: {
				background: {
					500: '#f7f5f0',
					700: '#ebe7de',
				},
				primary: {
					100: '#dcceee',
					200: '#b47bf8',
					300: '#7c32db',
					500: '#5d0fc0',
					600: '#642ea8',
					700: '#3d0283',
					800: '#32036a',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
};
