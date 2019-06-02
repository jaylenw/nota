var mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require('config');
mongoose.Promise = bluebird;

var databataseURI = config.get('db.databataseURI');

function verifiedConnectionToDB () {
	return new Promise(function(resolve, reject) {
		var isConnected = false;
		var counter = 0;
		var limit = 5;
		var timerObj = setInterval(function () {
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
