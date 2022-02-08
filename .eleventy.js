require('dotenv').config();

const fs = require('fs');
// const localImages = require('./.eleventy-local.js');
const lazyImages = require('eleventy-plugin-lazyimages');
const pluginRss = require('@11ty/eleventy-plugin-rss');

// Strip Ghost domain from urls
const stripDomain = (url) => {
   return url.replace(process.env.GHOST_API_URL, '');
};

module.exports = function (eleventyConfig) {

	eleventyConfig.addWatchTarget('./tailwind.config.js');
	eleventyConfig.addWatchTarget('./src/assets/css/_tailwind.css');

	eleventyConfig.addPassthroughCopy('./src/assets');

	eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');
	eleventyConfig.addLayoutAlias('post', 'layouts/post.njk');

	// Minify HTML
	//   config.addTransform('htmlmin', htmlMinTransform);

	// Add RSS plugin for sitemap
	eleventyConfig.addPlugin(pluginRss);

	//  Apply performance attributes to images
	// config.addPlugin(lazyImages, {
	//    cacheFile: '',
	// });

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
		return content.replace(process.env.WORDPRESS_API_URL, process.env.SITE_URL);
	});

	// Date formatting filter
	eleventyConfig.addFilter('wpDateToString', (dateString) => {
		const date = new Date(dateString);

		return date.toLocaleDateString('default', { year: 'numeric', month: 'long', day: 'numeric' });
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
