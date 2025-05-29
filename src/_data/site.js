require("dotenv").config();

module.exports = {
	title: 'DefiPlaza',
	description: 'Reducing the risk of Impermament Loss.',
	url: process.env.SITE_URL,
	icon: process.env.SITE_URL + '/assets/images/logo/icon.svg',
	cover_image: process.env.SITE_URL + '/assets/images/logo/social-media-share-calm.png',
	lang: 'en',
	twitter: '@defiplaza',
};