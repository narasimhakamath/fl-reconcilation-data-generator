const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');

// Function to make the login request
async function POST(request) {
	try {
		;
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/accounts`;

		const REQUEST_BODY = {
			name: faker.finance.accountName(),
			ledgerId: request.ledgerId,
			status: "ACTIVE",
			country: request.country.countryCode,
			currency: request.country.currencyCode,
			type: "Wallet",
			email: faker.internet.email(),
			// phone: faker.phone.number(),
			minBalance: 0,
			maxBalance: null,
			attributes: {},
			policies: {
				allowBranching: false,
				enableLimits: false,
				enableLiens: false,
				enableKyc: false,
				enforceLimits: false
			}
		};
		

		const REQUEST_HEADERS = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `JWT ${request.token}`
			}
		}

		// console.log(chalk.white.bold(`Request URL: ${REQUEST_URL}`));
		// console.log(chalk.white.bold(`Request Body:`), chalk.white(JSON.stringify(REQUEST_BODY)));

		const response = await axios.post(REQUEST_URL, REQUEST_BODY, REQUEST_HEADERS);

		return response.data;
	} catch (error) {
		console.log(chalk.red.bold(`Account creation error:`), chalk.white(JSON.stringify(error)))
		return null;
	}
}

module.exports = { POST };
