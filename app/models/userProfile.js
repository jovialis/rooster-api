const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({

}, {
	collection: 'userProfiles'
});

module.exports = mongoose.model('UserProfile', userProfileSchema);