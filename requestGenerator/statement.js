const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

// Function to make the login request
async function POST(request) {
	try {
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/statements`;

		const REQUEST_BODY = {
			physicalAccountId: request.physicalAccountNumber,
			ledgerId: request.ledgerId,
			indicator: request.indicator,
			transactionReferenceId: request.transactionReferenceID,
			amount: request.amount,
			currency: request.country.currencyCode,
			created: new Date()?.toISOString()
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
		console.log(chalk.red.bold(`Statement creation error:`), chalk.white(error))
		return null;
	}
}

async function generateRequestBody(request) {
	const REQUEST_BODY = {
		physicalAccountId: request.physicalAccountNumber,
		ledgerId: request.ledgerId,
		indicator: request.indicator,
		transactionReferenceId: request.transactionReferenceID,
		amount: request.amount,
		currency: request.country.currencyCode,
		created: new Date()?.toISOString()
	};

	return REQUEST_BODY;
};

async function bulkPOST(request) {
	try {
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/statements/utils/bulkUpsert?update=false&insert=true`;
	
		const REQUEST_BODY = {
			docs: request.REQUEST_BODY
		};
	
		const REQUEST_HEADERS = {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `JWT ${request.token}`
			}
		}

		const response = await axios.post(REQUEST_URL, REQUEST_BODY, REQUEST_HEADERS);
		return response.data;
	} catch(error) {
		console.log(chalk.red.bold(`Statement creation error:`), chalk.white(error))
		return null;
	}
};

module.exports = { POST, generateRequestBody, bulkPOST };
