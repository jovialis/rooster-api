const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const uuid = require('uuid/v4');

const userSessionSchema = new Schema({
	uid: {
		type: String,
		default: uuid
	},
	user: {
		type: mongoose.Types.ObjectId,
		ref: 'User'
	},
	timestamp: {
		type: Date,
		default: Date.now
	},
	lastRequest: {
		type: Date,
		default: Date.now
	},
	agent: {
		type: String,
		default: 'Unknown'
	}
}, {
	collection: 'userSessions'
});

module.exports = mongoose.model('UserSession', userSessionSchema);