var mongoose = require('mongoose');
var bluebird = require('bluebird');
mongoose.Promise = bluebird;

var databataseURI = 'mongodb://localhost/nota-test';

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
    console.log('Failed to drop db');
  });
}
