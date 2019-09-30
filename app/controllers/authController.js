const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import models
const User = require('../models/user');
const UserAuthenticator = require('../models/userAuthenticator');
const UserSession = require('../models/userSession');

// Site-Specific Login POST Middlewares to validate/sanitize Body
module.exports.login_native_post_middleware = [
	// Validate fields
	check('username').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
	check('password').not().isEmpty().withMessage('Password cannot be null')
];

// Site-Authenticator-Specific Login POST
module.exports.login_native_post = (req, res, next) => {
	// Ensure there were no validation errors
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		let firstError = validationErrors.array({onlyFirstError: true})[0];

		// Ensure error details are passed to Express for export
		firstError.name = "error_auth_login_credentials";
		firstError.description = firstError.msg;
		firstError.code = 400;

		next(firstError);
		return;
	}

	// Extract login info from request body
	const email = req.body.username;
	const password = req.body.password;

	// Discover User document by email
	User.findOne({
		email: email
	}).populate('authenticator').then(async user => {
		if (!user) {
			// Generate error if no user found
			let error = Error('Invalid username or password');
			error.name = "error_auth_login_credentials";
			error.code = 400;
			next(error);
			return;
		}

		// Extract user login information
		const authenticator = user.authenticator;

		// Ensure authenticator supports password
		if (authenticator.method !== 'NativeUserAuthenticator') {
			// Generate error for incompatible login method
			let error = Error('This account does not use native password login');
			error.name = "error_auth_login_method";
			error.code = 405;
			next(error);
			return;
		}

		// Extract hashed password from authenticator
		const hash = authenticator.hash;

		// Compare hash with password
		const passwordValid = await bcrypt.compare(password, hash);
		if (!passwordValid) {
			// Generate error if invalid password
			let error = Error('Invalid username or password');
			error.name = "error_auth_login_credentials";
			error.code = 400;
			next(error);
			return;
		}

		const userId = user._id;
		const agent = req.get('User-Agent');

		// Create session document
		UserSession.create({
			user: userId,
			agent: agent
		}).then(session => {
			// Extract session UID
			const sessionUid = session.uid;

			// Create and sign web token containing the session's UID
			const signedToken = jwt.sign({
				uid: sessionUid
			}, process.env.JWT_SECRET, {
				expiresIn: '1d'
			});

			// Set cookie with token
			res.cookies.set('session', signedToken, {
				domain: 'rooster.herokuapp.com',
				secure: true,
				signed: true,
				overwrite: true
			});

			// Return JSON data
			res.json({
				user: {
					uid: user.uid
				}
			});
		}).catch(next);
	}).catch(next);
};

module.exports.register_native_post = (req, res, next) => {

};

// Logout GET
module.exports.logout_get = (req, res, next) => {
	// Unset session cookie
	req.cookies.set('session');

	// TODO: Redirect to given destination
};