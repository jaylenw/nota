const mongoose = require('mongoose');
const bluebird = require('bluebird');
const config = require('config');
mongoose.Promise = bluebird;
const mgs = mongoose;

let databataseURI = config.get('db.databataseURI');

function verifiedConnectionToDB () {
	return new Promise(function(resolve, reject) {
		let counter = 0;
		let limit = 5;
		let timerObj = setInterval(function () {
			mgs.connect(databataseURI, {
				useNewUrlParser: true
			}).then(function() {
				console.log('Connected to DB.');
				clearInterval(timerObj);
				resolve();
				return;
			}).catch(function() {
				console.log('Failed to connect to DB.');
				counter = counter + 1;
			});
			if (counter === limit) {
				clearInterval(timerObj);
				console.log(limit + ' failed attempts to connect to the DB.');
				reject();
				return;
			}
		}, 5000);
	});
}

module.exports.verifiedConnectionToDB = verifiedConnectionToDB;
module.exports.mgs = mgs;
