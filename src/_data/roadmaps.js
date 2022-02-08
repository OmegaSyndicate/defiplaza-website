const fetch = require('node-fetch');

require('dotenv').config();

// Fetch the most recent 10 posts
// If we want more, we can loop through requests, up to 100 at a time, and append them to an array
// https://developer.wordpress.org/rest-api/using-the-rest-api/pagination/

module.exports = async () => {
	const res = await fetch(process.env.WORDPRESS_API_URL + process.env.WORDPRESS_API_PATH + 'roadmap');
	const items = await res.json();

	const sortedItems = items.sort((a, b) => {
		if (a.acf.roadmap_item_date > b.acf.roadmap_item_date) {
			return 1;
		} else if (a.acf.roadmap_item_date < b.acf.roadmap_item_date) {
			return -1;
		}

		return 0;
	});

	for (let item of sortedItems) {
		const date = new Date(item.acf.roadmap_item_date.substring(0, 4), item.acf.roadmap_item_date.substring(4, 6) - 1, item.acf.roadmap_item_date.substring(6, 8));
		const now = new Date();
		let dateString = '';

		// if in the past, use Month, Year
		if (date.getTime() < now.getTime()) {
			dateString = date.toLocaleDateString('default', { year: 'numeric', month: 'long' });
		}
		// if in the future, use queueMicrotask, Year
		else {
			const quarter = Math.floor((date.getMonth() + 3) / 3);

			dateString = `Q${quarter} ${date.getFullYear()}`;
		}
		
		item.acf.roadmap_item_date = dateString;
	}

	return sortedItems;
};