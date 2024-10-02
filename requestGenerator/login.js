const axios = require('axios');

// Function to make the login request
async function login(request) {
	try {
		const requestBody = {
			username: request.username,
			password: request.password,
		};


		const response = await axios.post(`${request.APP.baseURL}/api/a/rbac/auth/login`, requestBody);

		return response.data;
	} catch (error) {
		console.error('Login failed:', error.response ? error.response.data : error.message);
		return null;
}
}
module.exports = { login };
