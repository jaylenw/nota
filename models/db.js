var mongoose = require('mongoose');

var databataseURI = 'mongodb://localhost/nota-test';

if (process.env.NODE_ENV === 'production'){
  databataseURI = 'mongodb://localhost/nota';
}
mongoose.connect(databataseURI, {
  useMongoClient: true
});
