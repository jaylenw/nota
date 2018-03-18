var chai = require('chai');
var assert = chai.assert;
var axios = require('axios');
var app = require('../app.js');
var cleanDB = require('./clean/drop_db.js');

before(function(done) {
  server = app.listen(3000, done);
})

describe('nota tests', function() {

  var axiosInstance = axios.create({
    baseURL: 'http://0.0.0.0:3000',
    timeout: 1000
  })

  describe('Users tests', function() {

    it('register user', function(done) {
      axiosInstance.post('users/register', {
        email: 'testing1@test.com',
        password: 'test123'
      })
      .then(function (response) {
        console.log(response);
        assert(response.status === 201);
        assert.exists(response.data.token);
        done();
      })
      .catch(function (error){
        console.log(error);
      })
    });
  });
});

after(function(done) {
  cleanDB(done);
})
