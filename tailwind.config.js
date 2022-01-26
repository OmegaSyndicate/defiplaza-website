module.exports = {
	mode: 'jit',
	content: ['src/**/*.njk', 'src/**/*.svg'],
	theme: {
		container: {
			center: true,
		},
		fontFamily: {
			sans: ['NB_International_Pro', 'sans-serif'],
			serif: ['ivypresto-display', 'serif'],
		},
		extend: {
			colors: {
				background: {
					500: '#e1d6c5',
					700: '#ebe7de',
				},
				primary: {
					300: '#7c32db',
					500: '#5d0fc0',
					700: '#3d0980',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms'), require('@tailwindcss/line-clamp')],
};
