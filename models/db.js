var mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require('config');
mongoose.Promise = bluebird;

var databataseURI = config.get('db.databataseURI');

mongoose.connect(databataseURI, {
  useMongoClient: true
});
