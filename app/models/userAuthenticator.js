const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Represents a generic authentication scheme for a user
const userAuthenticatorSchema = new Schema({
	user: {
		type: mongoose.Types.ObjectId,
		ref: 'User',
		required: true
	}
}, {
	collection: 'userAuthenticators',
	discriminatorKey: 'method'
});

// Represents an authentication scheme using site-specific username/password
const nativeUserAuthenticatorSchema = new Schema({
	hash: {
		type: String,
		required: true
	}
});

// Represents an authentication scheme using Google tokens
const googleUserAuthenticationSchema = new Schema({
	// TODO: Implement Google Authentication
});

const userAuthenticatorModel = mongoose.model('UserAuthenticator', userAuthenticatorSchema);

// Register discriminators
userAuthenticatorModel.discriminator('NativeUserAuthenticator', nativeUserAuthenticatorSchema);
userAuthenticatorModel.discriminator('GoogleUserAuthenticator', googleUserAuthenticationSchema);

module.exports = userAuthenticatorModel;