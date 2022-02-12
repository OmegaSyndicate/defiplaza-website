require("dotenv").config();

module.exports = {
	title: 'DefiPlaza',
	description: 'The low-cost exchange on Ethereum',
	url: process.env.SITE_URL,
	icon: process.env.SITE_URL + '/assets/images/logo/icon.svg',
	cover_image: process.env.SITE_URL + '/assets/images/logo/social-media.png',
	lang: 'en_US',
	twitter: '@defiplaza',
};