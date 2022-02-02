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
			...defaultConfig.theme.fontFamily.mono
		},
		extend: {
			colors: {
				background: {
					500: '#f7f5f0',
					700: '#ebe7de',
				},
				backgroundDark: {
					500: '#615C55',
				},
				primary: {
					300: '#7c32db',
					500: '#5d0fc0',
					700: '#3d0283',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
};
