const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

// Function to make the login request
async function POST(request) {
	try {
		console.log();
		const REQUEST_URL = `${request.APP.baseURL}/b2b/pipes/${request.APP.appName}/payment`;

		const REQUEST_BODY = {
			category: "recon-automation-data",
			paymentInfo: {
				accountId: request.accountId,
				currency: request.country.currencyCode,
				platformRefNo: "VENDORPAY",
				externalRefId: request.transactionReferenceID,
				controlSum: request.amount
			},
			creditTransactionInfo: [
				{
					fragmentPlatformRefNo: "PAY01",
					endToEndId: "e2e",
					amount: request.amount,
					currency: request.country.currencyCode,
					account: {
						beneficiaryAccountId: faker.finance.account(16),
						beneficiaryName: "Narasimha Kamath",
						transferType: "FTS",
						transferValueDate: "22032023",
						beneficiaryAddressLine1: "Address Line 1",
						beneficiaryAddressLine2: "Address Line 2",
						beneficiaryAddressLine3: "Address Line 3",
						beneficiaryAddressLine4: "Address Line 4",
						chargeOption: "OUR",
						beneficiaryCountry: request.country.countryCode,
						beneficiaryBankName: "ABDI BANK",
						beneficiaryBankReferenceBic: "ABDIAEADXXX",
						beneficiaryBankCountry: request.country.countryCode,
						// remittanceInformationLine1: faker.lorem.sentence(4),
						remittanceInformationLine1: "NS",
						// remittanceInformationLine2: faker.lorem.sentence(4),
						remittanceInformationLine2: "NS",
						// remittanceInformationLine3: faker.lorem.sentence(4),
						remittanceInformationLine3: "NS",
						// remittanceInformationLine4: faker.lorem.sentence(4),
						remittanceInformationLine4: "NS",
					}
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
		console.log(chalk.red.bold(`Payment creation error:`), chalk.white(error))
		return null;
}
}
module.exports = { POST };
