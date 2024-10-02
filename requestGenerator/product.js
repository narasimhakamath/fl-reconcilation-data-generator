const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');

// Function to make the login request
async function POST(request) {
	try {
		;
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/product`;

		const REQUEST_BODY = {
			name: faker.commerce.productName(),
			description: faker.lorem.sentence(),
			policies: {
				manageLedgerAccounts: true,
				enableTransactions: true,
				enablePayouts: true,
				enableLimits: false,
				enforceLimits: false,
				enableBalances: true,
				enableLiens: false,
				enableKyc: false
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

		;

		return response.data;
	} catch (error) {
		console.log(chalk.red.bold(`Product creation error:`), chalk.white(JSON.stringify(error)))
		return null;
}
}
module.exports = { POST };
