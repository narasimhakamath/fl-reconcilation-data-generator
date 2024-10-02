const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

// Function to make the login request
async function POST(request) {
	try {
		console.log();
		const REQUEST_URL = `${request.APP.baseURL}/b2b/pipes/${request.APP.appName}/transaction`;

		const REQUEST_BODY = {
			transactionReferenceId: request.referenceId,
			externalRefId: request.referenceId,
			type: request.type,
			entries: [
				{
					accountId: request.accountId,
					indicator: "CREDIT",
					amount: request.amount,
					currency: request.country.currencyCode
				},
				{
					accountId: `${request.ledgerId}-CASH`,
					indicator: "DEBIT",
					amount: request.amount,
					currency: request.country.currencyCode
				}
			]
		};
		
		const REQUEST_HEADERS = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `JWT ${request.token}`
			}
		}

		console.log(chalk.white.bold(`Request URL: ${REQUEST_URL}`));
		console.log(chalk.white.bold(`Request Body:`), chalk.white(JSON.stringify(REQUEST_BODY)));

		const response = await axios.post(REQUEST_URL, REQUEST_BODY, REQUEST_HEADERS);

		console.log();

		return response.data;
	} catch (error) {
		console.log(chalk.red.bold(`Transaction creation error:`), chalk.white(error))
		return null;
}
}
module.exports = { POST };
