/*
<script src="https://cdn.jsdelivr.net/npm/chart.js@3.5.1/dist/chart.min.js" integrity="sha256-bC3LCZCwKeehY6T4fFi9VfOU0gztUa+S4cnkIhVPZ5E=" crossorigin="anonymous"></script>
<script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>
<script src="https://unpkg.com/dayjs@1.8.21/plugin/relativeTime.js"></script>
*/

jQuery(document).ready(function () {
	dayjs.extend(window.dayjs_plugin_relativeTime);

	const queryBody = JSON.stringify({
		query: `{
    	    factories(first: 1) {
    	        totalValueLockedUSD
    	    }
    	    transactions(first: 1, orderBy: timestamp, orderDirection: desc) {
                blockNumber
                timestamp
              }
    	    dailies(first: 60, orderBy: date, orderDirection: desc) {
                date
                liquidityUSD
                tradeVolumeUSD
                swapUSD
                totalValueLockedUSD
                dfp2MarketCap
                xdp2TotalSupply
            }
            dailyTokens(first: 60, where: { token:\"0x2f57430a6ceda85a67121757785877b4a71b8e6d\" }, orderBy: date, orderDirection: desc) {
                date
                tokenPriceUSD
                tokenPriceMin
                tokenPriceMax
            }
            swaps(first: 20, orderBy: timestamp, orderDirection: desc) {
                id
                timestamp
                inputToken {
                  symbol
                  tokenPriceUSD
                }
                inputAmount
                outputToken {
                  symbol
                  tokenPriceUSD
                }
                outputAmount
                swapUSD
            }
            tokens(first: 16, orderBy: tokenAmount, orderDirection: desc) {
                id
                symbol
                tokenAmount
                tokenPriceUSD
            } 
            _meta(id:null) {
                block {
                  number
                }
                deployment
                hasIndexingErrors
              }
    	}`,
	});

	fetch('https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: queryBody,
	})
		.then(function (result) {
			return result.json();
		})
		.then(function (jsonResult) {
			return jsonResult.data;
		})
		.then(function (graphData) {
			// Do a health check on subgraph synced
			healthCheck(graphData._meta.block.number);

			// Display TVL
			var tvl = graphData.factories[0].totalValueLockedUSD;

			jQuery('#tvl h3').text(prettyDollar(tvl));
			jQuery('#marketCap h3').text(prettyDollar(graphData.dailies[0].dfp2MarketCap));

			// Make last day, the first day
			graphData.dailies.reverse();
			graphData.dailyTokens.reverse();

			// Build graphs
			tvlChart(graphData.dailies);
			marketCapChart(graphData.dailies);

			xdp2Chart(graphData.dailies);
			dfp2PriceChart(graphData.dailyTokens);

			liquidityChart(graphData.dailies);

			swapChart(graphData.dailies);

			// Build tables
			tokensTable(graphData.tokens);

			transactionsTable(graphData.swaps);

			// Show XDP2 price
			var lastXDP2 = graphData.dailies[graphData.dailies.length - 1];
			var xdp2Price = lastXDP2['totalValueLockedUSD'] / lastXDP2['xdp2TotalSupply'];
			jQuery('#xdp2Price h3').text(prettyDollar(xdp2Price));

			// Show DFP2 price
			var lastDFP2 = graphData.dailyTokens[graphData.dailyTokens.length - 1];
			jQuery('#dfp2Price h3').text(prettyDollar(lastDFP2.tokenPriceUSD));
		});
});

let coingeckoPrices;
let coingeckoTokens = {
	AAVE: 'aave',
	COMP: 'compound-governance-token',
	CRV: 'curve-dao-token',
	DAI: 'dai',
	ETH: 'ethereum',
	eXRD: 'e-radix',
	LINK: 'chainlink',
	MATIC: 'matic-network',
	MKR: 'maker',
	SPELL: 'spell-token',
	SUSHI: 'sushi',
	UNI: 'uniswap',
	USDC: 'usd-coin',
	USDT: 'tether',
	WBTC: 'wrapped-bitcoin',
	YFI: 'yearn-finance',
};
let chartScales = {
	y: {
		beginAtZero: true,
		position: 'right',
		ticks: {
			// Include a dollar sign in the ticks
			callback: function (value, index, values) {
				return prettyDollar(parseFloat(value));
			},
		},
		grid: {
			borderColor: 'rgb(236, 198, 168)',
			color: 'rgba(47, 79, 126, 0.1)',
		},
	},
	x: {
		grid: {
			borderColor: 'rgb(236, 198, 168)',
			color: 'rgba(47, 79, 126, 0.1)',
		},
	},
};
let weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getCoinGeckoPrices() {
	let tokens = [];

	for (let symbol in coingeckoTokens) {
		tokens.push(coingeckoTokens[symbol]);
	}

	return fetch(
		`https://api.coingecko.com/api/v3/simple/price/?` +
			new URLSearchParams({
				ids: tokens.join(','),
				vs_currencies: 'USD',
			}),
		{
			method: 'GET',
		}
	)
		.then((response) => response.json())
		.then((data) => {
			coingeckoPrices = data;
		});
}

function getPrice(token) {
	if (coingeckoPrices[coingeckoTokens[token.symbol]]) {
		return coingeckoPrices[coingeckoTokens[token.symbol]].usd;
	}

	return token.tokenPriceUSD;
}

function prettyDollar(value) {
	return '$' + prettyValue(value);
}
function prettyValue(value) {
	var size = 'M';
	var prettyValue;

	if (value < 1) {
		prettyValue = parseFloat(value).toFixed(3);
		size = '';
	} else if (value < 1000) {
		prettyValue = parseFloat(value).toFixed(2);
		size = '';
	} else if (value < 10000) {
		prettyValue = Math.round(value);
		size = '';
	} else if (value < 100000) {
		prettyValue = parseFloat(value / 1000).toFixed(1);
		size = 'K';
	} else if (value < 1000000) {
		prettyValue = Math.round(value / 1000);
		size = 'K';
	} else {
		prettyValue = parseFloat(value / 1000000).toFixed(2);
	}

	return prettyValue.toLocaleString() + size;
}

function tvlChart(dailies) {
	lineChart('tvlChart', 'TVL', dailies, 'totalValueLockedUSD', true);
}

function marketCapChart(dailies) {
	lineChart('marketCapChart', 'DFP2 Market Cap', dailies, 'dfp2MarketCap', true);
}

function liquidityChart(dailies) {
	barChart('liquidityChart', 'Daily Liquidity Change', dailies, 'liquidityUSD');
}

function dfp2PriceChart(dailies) {
	lineChart('dfp2PriceChart', 'DFP2 price in USD', dailies, 'tokenPriceUSD', false);
}

function swapChart(dailies) {
	barChart('swapChart', 'Daily Trade Volume', dailies, 'tradeVolumeUSD');
}

function xdp2Chart(dataPoints) {
	let labels = [];
	let data = [];
	let pointBorderColors = [];
	let pointBackgroundColors = [];

	for (let point of dataPoints) {
		let date = new Date(point.date * 1000);
		labels.push(weekdays[date.getDay()] + ' ' + date.getDate() + '/' + (date.getMonth() + 1));
		let value = point['totalValueLockedUSD'] / point['xdp2TotalSupply'];

		console.log(point['totalValueLockedUSD'], point['xdp2TotalSupply'], value);
		data.push(value);

		pointBorderColors.push('rgb(47, 79, 126)');
		pointBackgroundColors.push('rgba(47, 79, 126, 0.5)');
	}

	labels[labels.length - 1] = 'Today';
	pointBorderColors[pointBorderColors.length - 1] = 'rgba(47, 79, 126, 0.5)';
	pointBackgroundColors[pointBackgroundColors.length - 1] = 'rgba(47, 79, 126, 0.2)';

	const ctx = document.getElementById('xdp2PriceChart').getContext('2d');
	const myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [
				{
					label: 'XDP2 price in USD',
					data: data,
					backgroundColor: 'rgba(47, 79, 126, 0.5)',
					borderColor: 'rgb(47, 79, 126)',
					borderWidth: 1,
					fill: false,
					pointBorderColor: pointBorderColors,
					pointBackgroundColor: pointBackgroundColors,
					tension: 0.3,
					segment: {
						backgroundColor: function (ctx) {
							if (ctx.p0DataIndex == data.length - 2) {
								return 'rgba(47, 79, 126, 0.2)';
							}
							return undefined;
						},
						borderDash: function (ctx) {
							if (ctx.p0DataIndex == data.length - 2) {
								return [2, 2];
							}
							return undefined;
						},
					},
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: chartScales,
		},
	});
}

function tokensTable(tokens) {
	getCoinGeckoPrices().then(function (coingeckoPrices) {
		tokens.sort(function (a, b) {
			if (a.tokenAmount * getPrice(a) < b.tokenAmount * getPrice(b)) {
				return 1;
			}

			return -1;
		});

		let table = `
            <table>
            <thead>
            <tr>
                <td>Symbol</td>
                <td>Liquidity</td>
                <td>Token amount</td>
                <td>Price</td>
            </tr>
            </thead>`;

		for (let token of tokens) {
			table += `<tr>
            <td><a href="/token/${token.symbol.toLowerCase()}">${token.symbol}</a></td>
            <td>${prettyDollar(token.tokenAmount * getPrice(token))}</td>
             <td>${prettyValue(token.tokenAmount)}</td>
            <td>${prettyDollar(getPrice(token))}</td>
             
            </tr>`;
		}

		table += `</table>`;

		jQuery('#tokens').html(table);
	});
}

function transactionsTable(swaps) {
	let table = `
        <table>
        <thead>
        <tr>
            <td></td>
            <td>Total Value</td>
            <td>Token amount</td>
            <td>Token amount</td>
            <td>Date</td>
        </tr>
        </thead>`;

	for (let swap of swaps) {
		table += `<tr>
        <td><a href="https://etherscan.io/tx/${swap.id}" target="_blank">From ${swap.inputToken.symbol} to ${swap.outputToken.symbol}</a></td>
        <td>${prettyDollar(swap.swapUSD)}</td>
         <td>${prettyValue(swap.inputAmount)} ${swap.inputToken.symbol}</td>
        <td>${prettyValue(swap.outputAmount)} ${swap.outputToken.symbol}</td>
         <td>${dayjs(swap.timestamp * 1000).fromNow()} </td>
        </tr>`;
	}

	table += `</table>`;

	jQuery('#transactions').html(table);
}

function lineChart(chartId, label, dataPoints, dataPoint, fill) {
	let labels = [];
	let data = [];
	let pointBorderColors = [];
	let pointBackgroundColors = [];

	for (let point of dataPoints) {
		let date = new Date(point.date * 1000);
		labels.push(weekdays[date.getDay()] + ' ' + date.getDate() + '/' + (date.getMonth() + 1));
		data.push(point[dataPoint]);

		pointBorderColors.push('rgb(47, 79, 126)');
		pointBackgroundColors.push('rgba(47, 79, 126, 0.5)');
	}

	labels[labels.length - 1] = 'Today';
	pointBorderColors[pointBorderColors.length - 1] = 'rgba(47, 79, 126, 0.5)';
	pointBackgroundColors[pointBackgroundColors.length - 1] = 'rgba(47, 79, 126, 0.2)';

	const ctx = document.getElementById(chartId).getContext('2d');
	const myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: labels,
			datasets: [
				{
					label: label,
					data: data,
					backgroundColor: 'rgba(47, 79, 126, 0.5)',
					borderColor: 'rgb(47, 79, 126)',
					borderWidth: 1,
					fill: fill,
					pointBorderColor: pointBorderColors,
					pointBackgroundColor: pointBackgroundColors,
					tension: 0.3,
					segment: {
						backgroundColor: function (ctx) {
							if (ctx.p0DataIndex == data.length - 2) {
								return 'rgba(47, 79, 126, 0.2)';
							}
							return undefined;
						},
						borderDash: function (ctx) {
							if (ctx.p0DataIndex == data.length - 2) {
								return [2, 2];
							}
							return undefined;
						},
					},
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: chartScales,
		},
	});
}

function barChart(chartId, label, dataPoints, dataPoint) {
	let labels = [];
	let data = [];
	let backgroundColors = [];

	for (let point of dataPoints) {
		let date = new Date(point.date * 1000);
		labels.push(weekdays[date.getDay()] + ' ' + date.getDate() + '/' + (date.getMonth() + 1));
		data.push(point[dataPoint]);

		backgroundColors.push('rgba(47, 79, 126, 0.5)');
	}

	labels[labels.length - 1] = 'Today';
	backgroundColors[backgroundColors.length - 1] = 'rgba(47, 79, 126, 0.2)';

	const ctx = document.getElementById(chartId).getContext('2d');
	const myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [
				{
					label: label,
					data: data,
					backgroundColor: backgroundColors,
					borderColor: ['rgb(47, 79, 126)'],
					borderWidth: 1,
					fill: false,
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: chartScales,
		},
	});
}

function healthCheck(lastestBlockNumber) {
	const healthBody = JSON.stringify({
		query: `{
          indexingStatusForCurrentVersion(subgraphName: "omegasyndicate/defiplaza") {
            synced
            health
            fatalError {
              message
              block {
                number
                hash
              }
              handler
            }
            chains {
              chainHeadBlock {
                number
              }
              latestBlock {
                number
              }
            }
          }
        }`,
	});

	fetch('https://api.thegraph.com/index-node/graphql', {
		method: 'post',
		headers: {
			'Content-Type': 'application/json',
		},
		body: healthBody,
	})
		.then(function (result) {
			return result.json();
		})
		.then(function (jsonResult) {
			return jsonResult.data;
		})
		.then(function (graphData) {
			// Latest TheGraph block
			var lastestTheGraphBlock = graphData.indexingStatusForCurrentVersion.chains[0].latestBlock.number;
			var diff = lastestTheGraphBlock - lastestBlockNumber;

			// Display last block synced
			jQuery('#lastBlock').html(`<a href="https://etherscan.io/block/${lastestBlockNumber}" target="_blank">${lastestBlockNumber}</a>`);

			// Display warning banner, when more than 1 block difference
			if (diff > 4) {
				jQuery('#blockDiff').html(diff);
				jQuery('#warning-banner').show();
			}
		});
}
