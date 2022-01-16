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
