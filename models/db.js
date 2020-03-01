const mongoose = require('mongoose');
const bluebird = require('bluebird');
const config = require('config');
mongoose.Promise = bluebird;
const mgs = mongoose;

let databataseURI = config.get('db.databataseURI');

function verifiedConnectionToDB (debugMSG) {
	console.log('who called me?' + debugMSG);
	return new Promise(function(resolve, reject) {
		// let isConnected = false;
		let counter = 0;
		let limit = 5;
		let timerObj = setInterval(function () {
			mgs.connect(databataseURI, {
				useNewUrlParser: true
			}).then(function() {
				console.log('Connected to DB.');
				console.log('My counter in verifiedConnectionToDB is ' +  counter);
				console.log('who called me  inside the mgs.connect of verifiedConnectionToDB? ' + debugMSG);
				// isConnected = true;
				console.log('Clear interval');
				clearInterval(timerObj);
				resolve();
				return;
			}).catch(function() {
				console.log('Failed to connect to DB.');
				counter = counter + 1;
			});
			// if (isConnected) {
			// 	console.log('Clear interval');
			// 	clearInterval(timerObj);
			// 	resolve();
			// 	return;
			// }
			if (counter === limit) {
				clearInterval(timerObj);
				console.log(limit + ' failed attempts to connect to the DB.');
				reject();
				return;
			}
		}, 5000);
	});
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mgs.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

module.exports.verifiedConnectionToDB = verifiedConnectionToDB;
module.exports.mgs = mgs;
