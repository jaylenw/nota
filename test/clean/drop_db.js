const mongoose = require('mongoose');
const bluebird = require('bluebird');
const config = require('config');
const mdb = require('../../models/db');
// mongoose.Promise = bluebird;

const databataseURI = config.get('db.databataseURI');

// module.exports = function(done) {
// 		return mdb.mgs.connection.db.dropDatabase().then(function () {
// 			console.log('Dropped test db');
// 			return mdb.mgs.connection.close().then(function(){
// 				console.log('Disconnected from db.');
// 				return done();
// 			}).catch(function(){
// 				 console.log('Failed to disconnect from db');
// 			});
// 		}).catch(function() {
// 			console.log('Failed to drop test db');
// 		});
// };


module.exports = function() {
	return new Promise(function(resolve, reject) {
		return mdb.mgs.connection.db.dropDatabase().then(function () {
			console.log('Dropped test db');
			return mdb.mgs.connection.close().then(function(){
				console.log('Disconnected from db.');
				resolve();
				return;
			}).catch(function(){
				 console.log('Failed to disconnect from db');
				 reject();
				 return;
			});
		}).catch(function() {
			console.log('Failed to drop test db');
			reject();
			return;
		});
	});
};
