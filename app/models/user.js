const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shortid = require('shortid');

const userSchema = new Schema({
	uid: {
		type: String,
		default: shortid.generate,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	profile: {
		type: mongoose.Types.ObjectId,
		ref: 'UserProfile',
		required: true
	},
	authenticator: {
		type: mongoose.Types.ObjectId,
		ref: 'UserAuthenticator',
		required: true
	}
}, {
	collection: 'users'
});

module.exports = mongoose.model('User', userSchema);