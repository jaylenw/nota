const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Task = new Schema({
	accountId: {
		type: String
	},
	title: {
		type: String
	},
	body: {
		type: String
	},
	archive: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

mongoose.model('Task', Task);
