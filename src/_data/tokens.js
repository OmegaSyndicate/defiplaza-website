const fetch = require('node-fetch');

require('dotenv').config();

const GRAPH_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza';

const tokensQuery = `
	query {
		tokens(where: {tokenAmount_gt: "0"}, orderBy: symbol, orderDirection: asc) {
			id
			symbol
			tokenAmount
		}
	}
`;

async function sendRequest(query) {
	const init = {
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
	}
	const response = await fetch(GRAPH_ENDPOINT, {
		method: 'POST',
		body: JSON.stringify({ query: query })
	})

	// if (response.error()) {
	// 	throw response.errors;
	// }

	return await response.json();
}

module.exports = async () => {
	// const result = await sendRequest(tokensQuery);

	const res = await fetch(process.env.WORDPRESS_API_URL + process.env.WORDPRESS_API_PATH + 'token?per_page=100');
	return await res.json();

	// return result.data.tokens;
};