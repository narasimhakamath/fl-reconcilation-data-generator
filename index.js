const inquirer = require('inquirer');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');

const LOGIN_REQUESTS = require("./requestGenerator/login");
const PARTY_REQUESTS = require("./requestGenerator/party");
const PRODUCT_REQUESTS = require("./requestGenerator/product");
const LEDGER_REQUESTS = require("./requestGenerator/ledger");
const ACCOUNT_REQUESTS = require("./requestGenerator/account");
const TRANSACTION_REQUESTS = require("./requestGenerator/transaction");
const STATEMENT_REQUESTS = require("./requestGenerator/statement");
const PAYMENT_REQUESTS = require("./requestGenerator/payment");

const APP_LIST = {
	'DFL': {
		baseURL: `https://dev.dfl.datanimbus.com`,
		appName: `DFL`,
	},
	'DFLQA': {
		baseURL: `http://18.61.7.225`,
		appName: `DFLQA`,
	}
};

const COUNTRY_DATA = {
	'BH': {
		countryCode: 'BH',
		currencyCode: 'BHD',
		financialInstitutionID: 'NBOB',
		precision: 0.001
	},
	'AE': {
		countryCode: 'AE',
		currencyCode: 'AED',
		financialInstitutionID: '036',
		precision: 0.01
	}
};

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const main = async () => {
	try {
		let { APP_NAME, USERNAME, PASSWORD } = await inquirer.prompt([
			{
				type: 'list',
				name: 'APP_NAME',
				message: `Select the environment`,
				choices: Object.keys(APP_LIST),
			},
			{
				name: 'USERNAME',
				message: `What is the login username?`,
			},
			{
				type: 'password',
				name: 'PASSWORD',
				message: `What is the login password?`,
			}
		]);

		const APP = APP_LIST[APP_NAME];
		if(!APP)
			throw "Invalid app name";

		if(!USERNAME)
			throw "Invalid username";

		if(!PASSWORD)
			throw "Invalid password";


		const loginData = await LOGIN_REQUESTS.login({
			username: USERNAME,
			password: PASSWORD,
			APP: APP
		});

		if(!loginData?.token)
			throw "Failed to login.";

		const TOKEN = loginData.token;
		console.log(chalk.green.bold(`✓ Successfully logged in! Token: ${TOKEN}`));



		const { COUNTRY_CODE } = await inquirer.prompt([
			{
				type: 'list',
				name: `COUNTRY_CODE`,
				message: `Select the country code`,
				choices: ['BH', 'AE']
			}
		]);

		const party = await PARTY_REQUESTS.POST({
			country: COUNTRY_DATA[COUNTRY_CODE],
			APP: APP,
			token: TOKEN
		});

		if(!party?._id)
			throw "Failed to create party";
		console.log(chalk.green.bold(`✓ Party created successfully with ID: ${party._id}`));


		const product = await PRODUCT_REQUESTS.POST({
			APP: APP,
			token: TOKEN
		});

		if(!product?._id)
			throw "Failed to create product";
		console.log(chalk.green.bold(`✓ Product created successfully with ID: ${product._id}`));

		const ledger = await LEDGER_REQUESTS.POST({
			partyId: party._id,
			productId: product._id,
			country: COUNTRY_DATA[COUNTRY_CODE],
			token: TOKEN,
			APP: APP
		});

		if(!ledger?._id)
			throw "Failed to create ledger";
		console.log(chalk.green.bold(`✓ Ledger created successfully with ID: ${ledger._id}`));

		await delay(5000);

		const { ACCOUNT_COUNT, TRANSACTION_COUNT } = await inquirer.prompt([
			{
				name: `ACCOUNT_COUNT`,
				message: `How many accounts do you want to create?`,
			},
			{
				name: `TRANSACTION_COUNT`,
				message: `How many transactions do you want to create?`
			}
		]);


		if(isNaN(ACCOUNT_COUNT))
			throw "Invalid account number count";

		if(isNaN(TRANSACTION_COUNT))
			throw "Invalid transaction count";

		const accountIDs = [];
		const statementsData = [];

		for(let i = 0; i < ACCOUNT_COUNT; i++) {
			console.log(chalk.white(`Creating account #${i + 1}`));
			const account = await ACCOUNT_REQUESTS.POST({
				ledgerId: ledger._id,
				country: COUNTRY_DATA[COUNTRY_CODE],
				APP: APP,
				token: TOKEN
			});

			if(!account._id) {
				console.log(chalk.red.bold(`✗ Failed to create account`));
			} else {
				console.log(chalk.green.bold(`✓ Account created successfully with ID: ${account._id}`));

				accountIDs.push(account._id);
				
				const amount = faker.random.number({min: TRANSACTION_COUNT * 50, max: TRANSACTION_COUNT * 100, precision: COUNTRY_DATA[COUNTRY_CODE]['precision']});
				const transactionReferenceID = uuidv4();

				await delay(300);
				
				const transaction = await TRANSACTION_REQUESTS.POST({
					accountId: account._id,
					ledgerId: ledger._id,
					referenceId: transactionReferenceID,
					type: "Money-In",
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});

				if(!transaction?._id)
					console.log(chalk.red.bold(`✗ Failed to credit ${amount} to ${account._id}`));
				else if(transaction?._id)
					console.log(chalk.green.bold(`✓ Credited ${amount} to ${account._id}`));


				const statement = await STATEMENT_REQUESTS.generateRequestBody({
					physicalAccountNumber: ledger.internalAccount.number,
					ledgerId: ledger._id,
					indicator: 'CREDIT',
					transactionReferenceID: transactionReferenceID,
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});
	
				statementsData.push(statement);
			}

			console.log();
		}

		const getRandomAccountId = () => accountIDs[Math.floor(Math.random() * accountIDs.length)];
		const getBoolean = (probability = 0.3) => Math.random() < probability;

		for(let i = 0; i < TRANSACTION_COUNT; i++) {
			await delay(600);
			console.log(chalk.white(`Creating transaction #${i + 1}`));
			const accountID = getRandomAccountId();

			const amount = faker.random.number({min: 1, max: 100, precision: COUNTRY_DATA[COUNTRY_CODE]['precision']});
			const transactionReferenceID = uuidv4();

			if(getBoolean(0.75)) {
				const payment = await PAYMENT_REQUESTS.POST({
					accountId: accountID,
					transactionReferenceID: transactionReferenceID,
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});

				if(!payment?.length || !payment[0]?._id)
					console.log(chalk.red.bold(`✗ Failed to debit ${amount} to ${accountID}`));
				else if(payment?.length && payment[0]?._id)
					console.log(chalk.green.bold(`✓ Debited ${amount} to ${accountID}`));

				const statement = await STATEMENT_REQUESTS.generateRequestBody({
					physicalAccountNumber: ledger.internalAccount.number,
					ledgerId: ledger._id,
					indicator: 'DEBIT',
					transactionReferenceID: transactionReferenceID,
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});

				statementsData.push(statement);
			} else {
				const transaction = await TRANSACTION_REQUESTS.POST({
					accountId: accountID,
					ledgerId: ledger._id,
					referenceId: transactionReferenceID,
					type: "Money-In",
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});

				if(!transaction?._id)
					console.log(chalk.red.bold(`✗ Failed to debit ${amount} to ${accountID}`));
				else if(transaction?._id)
					console.log(chalk.green.bold(`✓ Debited ${amount} to ${accountID}`));

				const statement = await STATEMENT_REQUESTS.generateRequestBody({
					physicalAccountNumber: ledger.internalAccount.number,
					ledgerId: ledger._id,
					indicator: 'CREDIT',
					transactionReferenceID: transactionReferenceID,
					amount: amount,
					country: COUNTRY_DATA[COUNTRY_CODE],
					APP: APP,
					token: TOKEN
				});

				statementsData.push(statement);
			}

			console.log();
		}

		if(statementsData.length) {
			console.log();
			console.log(`Statements - Request Body: ${JSON.stringify(statements)}`);
			console.log();

			const statements = await STATEMENT_REQUESTS.bulkPOST({
				APP: APP,
				token: TOKEN,
				REQUEST_BODY: statementsData
			});

			if(statements?.length)
				console.log(chalk.white.bold(`✓ Bulk inserting ${statements.length} statements`));

			statements?.forEach(statement => {
				console.log(chalk.green.bold(`✓ Statement logged for ${statement.indicator} of ${statement.amount} to physical account for transaction reference ID: ${statement.transactionReferenceId}`));
			});
		}

		console.log(chalk.green.bold(`✓ Script run successfully.`));
	} catch(error) {
		console.log(chalk.red.bold(`✗ ${error}`));
	}
};

main();