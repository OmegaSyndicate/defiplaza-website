module.exports = {
	mode: 'jit',
	content: ['dist/**/*.html'],
	theme: {
		container: {
			center: true,
		},
		fontFamily: {
			sans: ['NB_International_Pro', 'sans-serif'],
			serif: ['Merriweather', 'serif'],
		},
		extend: {
			colors: {
				background: '#eeeae1',
				primary: {
					300: '#7c32db',
					500: '#5d0fc0',
					700: '#4e1a91',
				},
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
