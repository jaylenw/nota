const mongoose = require('mongoose');
const bluebird = require('bluebird');
const config = require('config');
mongoose.Promise = bluebird;

let databataseURI = config.get('db.databataseURI');

function verifiedConnectionToDB () {
	return new Promise(function(resolve, reject) {
		let isConnected = false;
		let counter = 0;
		let limit = 5;
		let timerObj = setInterval(function () {
			mongoose.connect(databataseURI, {
				useMongoClient: true
			}).then(function(msg) {
				console.log('Connected to DB.');
				console.log(msg);
				isConnected = true;
			}).catch(function(err) {
				console.log('Failed to connect to DB.');
				console.log(err);
				counter = counter + 1;
			});
			if (isConnected) {
				console.log('Clear interval');
				clearInterval(timerObj);
				resolve();
				return;
			}
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
