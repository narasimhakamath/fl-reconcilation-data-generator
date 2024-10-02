const axios = require('axios');
const faker = require('faker');
const chalk = require('chalk');

// Function to make the login request
async function POST(request) {
	try {
		console.log();
		const REQUEST_URL = `${request.APP.baseURL}/api/c/${request.APP.appName}/party`;

		const REQUEST_BODY = {
			name: faker.company.companyName(),
			country: request.country.countryCode,
			type: "Individual",
			company: {
				incorporationDate: faker.date.past().toISOString(),
				registrationNumber: faker.random.alphaNumeric(10),
				taxId: faker.random.alphaNumeric(10),
				taxType: "withdrawal",
				businessCategory: faker.commerce.department(),
				businessType: "Consultant",
				listingAuthority: faker.company.companyName(),
				email: faker.internet.email(),
				phone: faker.phone.phoneNumber()
			},
			individual: {
				nationality: faker.address.country(),
				dateOfBirth: faker.date.past(30).toISOString().split('T')[0],
				identificationDocument: "pricing_circuit.spf",
				identificationDocumentNumber: faker.random.alphaNumeric(10),
				identificationDocumentIssueDate: faker.date.past().toISOString(),
				identificationDocumentExpiryDate: faker.date.future().toISOString(),
				taxId: faker.random.alphaNumeric(10),
				email: faker.internet.email(),
				phone: faker.phone.phoneNumber()
			},
			address: {
				addressLine1: faker.address.streetAddress(),
				addressLine2: faker.address.secondaryAddress(),
				addressLine3: faker.address.city(),
				addressLine4: faker.address.zipCode()
			},
			description: faker.lorem.sentence()
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
		console.log(chalk.red.bold(`Party creation error:`), chalk.white(JSON.stringify(error)))
		return null;
}
}
module.exports = { POST };
