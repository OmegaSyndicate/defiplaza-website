require('dotenv').config();

const fs = require('fs');
// const localImages = require('./.eleventy-local.js');
const lazyImages = require('eleventy-plugin-lazyimages');
const pluginRss = require('@11ty/eleventy-plugin-rss');

const UpgradeHelper = require('@11ty/eleventy-upgrade-help');

// Strip Ghost domain from urls
const stripDomain = (url) => {
   return url.replace(process.env.GHOST_API_URL, '');
};

module.exports = function (eleventyConfig) {
	eleventyConfig.addPlugin(UpgradeHelper);

	eleventyConfig.addWatchTarget('./tailwind.config.js');
	eleventyConfig.addWatchTarget('./src/assets/css/_tailwind.css');

	eleventyConfig.addPassthroughCopy('./src/assets');

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
	 * This filter intakes a string, such as for a page title, and
	 * inserts a non-breaking space - nbsp; - between the last two words
	 * to prevent a single word dangling on the last line (called an "orphan" by typographers).
	 */
	eleventyConfig.addFilter('addNbsp', (str) => {
		if (!str) {
			return;
		}
		let title = str.replace(/((.*)\s(.*))$/g, '$2&nbsp;$3');
		title = title.replace(/"(.*)"/g, '\\"$1\\"');
		return title;
	});

	/**
	 * Return a subset of array items limited to the passed number.
	 * Usage: | limit(3)
	 */
	eleventyConfig.addFilter('limit', function (arr, limit) {
		return arr.slice(0, limit);
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
