var mongoose = require('mongoose');
var bluebird = require('bluebird');
var config = require('config');
mongoose.Promise = bluebird;

var databataseURI = config.get('db.databataseURI');
// var databataseURI = 'mongodb://localhost/nota-test';
//
// if (process.env.NODE_ENV === 'production'){
//   databataseURI = 'mongodb://localhost/nota';
// }
mongoose.connect(databataseURI, {
  useMongoClient: true
});
