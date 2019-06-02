var mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require('config');
mongoose.Promise = bluebird;

var databataseURI = config.get('db.databataseURI');

module.exports = function(done) {
	mongoose.connect(databataseURI, {
		useMongoClient: true
	})
		.then(function () {
			mongoose.connection.db.dropDatabase();
			console.log('Dropped test db');
			done();
		})
		.catch(function () {
			console.log('Failed to drop test db');
		});
};
