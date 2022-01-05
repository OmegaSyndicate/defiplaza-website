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
				primary: 'rgb(124, 50, 219)',
				'primary-dark': 'rgb(64, 10, 135)',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
};
