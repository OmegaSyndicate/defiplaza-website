require('dotenv').config();

const fs = require('fs');
const pluginRss = require('@11ty/eleventy-plugin-rss');

module.exports = function (eleventyConfig) {
	eleventyConfig.addWatchTarget('./tailwind.config.js');
	eleventyConfig.addWatchTarget('./src/assets/css/_tailwind.css');

	eleventyConfig.addPassthroughCopy('./src/assets');
	eleventyConfig.addPassthroughCopy('./src/_redirects');

	eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');
	eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

	// Add RSS plugin for sitemap
	eleventyConfig.addPlugin(pluginRss);

	eleventyConfig.addNunjucksGlobal('version', () => {
		return process.env.CF_PAGES_COMMIT_SHA || Date.now();
	});

	eleventyConfig.addFilter('getReadingTime', (text) => {
		const wordsPerMinute = 200;
		const numberOfWords = text.split(/\s/g).length;
		return Math.ceil(numberOfWords / wordsPerMinute);
	});

	// Replace WordPress CMS urls with frontend urls
	eleventyConfig.addFilter('wpUrls', (content) => {
		const re = new RegExp(process.env.WORDPRESS_API_URL, 'ig');
		return content.replace(re, process.env.SITE_URL);
	});

	// Date formatting filter
	eleventyConfig.addFilter('wpDateToString', (dateString) => {
		const date = new Date(dateString);

		return date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });
	});
	eleventyConfig.addFilter('date', (dateString) => {
		const date = new Date(dateString);

		return date.toISOString();
	});

	eleventyConfig.addFilter('excerpt', (post) => {
		const content = post.replace(/(<([^>]+)>)/gi, '');
		return content.substr(0, content.lastIndexOf(' ', 200)) + '...';
	});

	/**
	 * Return a subset of array items limited to the passed number.
	 * Usage: | limit(3)
	 */
	eleventyConfig.addFilter('limit', function (arr, limit) {
		return arr.slice(0, limit);
	});

	eleventyConfig.addFilter('debug', function (arr) {
		return JSON.stringify(arr);
	});

	eleventyConfig.addFilter('category', function (arr, cat_id) {
		var posts = [];

		for (post of arr) {
			if (!post.howto_category) {
				continue;
			}
			if (post.howto_category.indexOf(cat_id) == -1) {
				continue;
			}

			posts.push(post);
		}

		return posts;
	});

	// Display 404 page in BrowserSnyc
	eleventyConfig.setBrowserSyncConfig({
		callbacks: {
			ready: (err, bs) => {
				const content_404 = fs.readFileSync('dist/404.html');

				bs.addMiddleware('*', (req, res) => {
					// Provides the 404 content without redirect.
					res.write(content_404);
					res.end();
				});
			},
		},
	});

	// Eleventy configuration
	return {
		dir: {
			input: 'src',
			output: 'dist',
		},

		// Files read by Eleventy, add as needed
		templateFormats: ['njk', 'md', 'txt'],
		htmlTemplateEngine: 'njk',
		markdownTemplateEngine: 'njk',
		passthroughFileCopy: true,
	};
};
