const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
	email: {
		type: String
	},
	password: {
		type: String
	},
	salt: {
		type: String
	},
	reset_token: {
		type: String
	}
});

mongoose.model('User', User);
