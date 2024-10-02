const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');

const generateLedgerID = () => {
	let result = '';
	
	for (let i = 0; i < 3; i++) {
		result += Math.floor(Math.random() * 9) + 1; // Random digit between 1 and 9
	}
	for (let i = 0; i < 3; i++) {
		result += Math.floor(Math.random() * 10); // Random digit between 0 and 9
	}
	
	return result;
};

// Function to make the login request
async function POST(request) {
	try {
		;
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/ledgers`;

		const REQUEST_BODY = {
			name: faker.commerce.productName(),
			partyId: {
				_id: request.partyId
			},
			productId: {
				_id: request.productId
			},
			notionalBalance: {
				currency: request.country.currencyCode
			},
			status: "ACTIVE",
			depth: 3,
			permittedPaymentRails: ["SWIFT", "Internal", "FTS"],
			policies: {
				manageLedgerAccounts: true,
				ledgerAccountIdentifier: `generateIBAN(country,bank,accountNb)`,
				enableTransactions: true,
				enablePayouts: true,
				enableLimits: false,
				enforceLimits: false,
				enableBalances: true,
				enableBalanceThresholds: false,
				enableLiens: false,
				enableKyc: false
			},
			internalAccount: {
				number: faker.finance.account(16),
				country: request.country.countryCode,
				currency: request.country.currencyCode,
				finInstId: request.country.financialInstitutionID
			}
		};

        if(request.country.countryCode == "AE")
			REQUEST_BODY._id = generateLedgerID();

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
		console.log(chalk.red.bold(`Ledger creation error:`), chalk.white(JSON.stringify(error)))
		return null;
}
}
module.exports = { POST };
