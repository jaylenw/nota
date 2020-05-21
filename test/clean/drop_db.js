const mdb = require('../../services/db');

module.exports = function() {
	return new Promise(function(resolve, reject) {
		return mdb.mgs.connection.db.dropDatabase().then(function() {
			console.log('Dropped test db');
			return mdb.mgs.connection.close().then(function() {
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
