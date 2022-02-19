require("dotenv").config();

module.exports = {
	title: 'DefiPlaza',
	description: 'The lowest fees of any exchange on Ethereum',
	url: process.env.SITE_URL,
	icon: process.env.SITE_URL + '/assets/images/logo/icon.svg',
	cover_image: process.env.SITE_URL + '/assets/images/logo/social-media-share.png',
	lang: 'en_US',
	twitter: '@defiplaza',
};