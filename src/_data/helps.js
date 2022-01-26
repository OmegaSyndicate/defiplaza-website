const fetch = require('node-fetch');

require('dotenv').config();

// Fetch the most recent 10 posts
// If we want more, we can loop through requests, up to 100 at a time, and append them to an array
// https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/

module.exports = async () => {
	const res = await fetch(process.env.WORDPRESS_API_URL + 'help?per_page=100&order=asc&_embed=author,wp:term');
	return await res.json();
};
