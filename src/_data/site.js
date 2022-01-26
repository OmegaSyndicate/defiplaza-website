require("dotenv").config();

module.exports = {
	title: 'DefiPlaza',
	description: 'the low-cost exchange',
	url: process.env.SITE_URL,
	icon: process.env.SITE_URL + '/assets/images/logo/icon-dark@3x.png',
	cover_image: process.env.SITE_URL + '/assets/images/logo/logo@3x.png',
	lang: 'en_US',
	twitter: '@defiplaza',
};