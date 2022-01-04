module.exports = {
	mode: 'jit',
	purge: ['dist/**/*.html'],
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
				primary: 'rgb(124, 50, 219)',
				'primary-dark': '#4e1a91',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
