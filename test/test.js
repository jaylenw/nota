var chai = require('chai');
var assert = chai.assert;
var axios = require('axios');
var moment = require('moment');
var app = require('../app.js');
var cleanDB = require('./clean/drop_db.js');

var user1_Token = '';
var user1_Email = 'testing1@test.com';
var user1_Password = 'test123';
var user1_AccountID = '';

var note1_Title = 'note 1 title';
var note1_Body = 'note 1 body';
var note1_ID = '';
var note1_Archive = false;

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
      axiosInstance.post('/users/register', {
        email: user1_Email,
        password: user1_Password
      })
      .then(function (response) {
        console.log(response.status);
        console.log(response.data);
        assert(response.status === 201);
        assert.exists(response.data.token);
        user1_Token = response.data.token;
        done();
      })
      .catch(function (error){
        console.log(error);
      })
    });

    it('create first note', function(done) {
      axiosInstance.post('/tasks', {
        token: user1_Token,
        title: note1_Title,
        body: note1_Body
      })
      .then(function (response) {
        console.log(response.status);
        console.log(response.data);
        assert(response.status === 201);
        assert(response.data.title === note1_Title);
        assert(response.data.body === note1_Body);
        assert(response.data.archive === note1_Archive);
        assert.exists(response.data._id);
        assert.exists(response.data.accountId);
        assert(moment(response.date).isValid());
        note1_ID = response.data._id;
        user1_AccountID = response.data.accountId;
        done();
      })
      .catch(function (error){
        console.log(error);
      })
    });

    it('edit first note', function(done) {
      note1_Title = note1_Title + ' plus edited';
      note1_Body = note1_Body + ' plus edited';
      note1_Archive = true;
      axiosInstance.put('/tasks/' + note1_ID, {
        token: user1_Token,
        title: note1_Title,
        body: note1_Body,
        archive: note1_Archive
      })
      .then(function (response) {
        console.log(response.status);
        console.log(response.data);
        assert(response.status === 200);
        assert(response.data.ok === 1);
        assert(response.data.nModified === 1);
        done();
      })
      .catch(function (error){
        console.log(error);
      })
    });

    it('get all tasks', function(done) {
      axiosInstance.get('/tasks?token=' + user1_Token)
      .then(function (response) {
        console.log(response.status);
        console.log(response.data);
        assert(response.status === 200);
        assert(response.data[0]._id === note1_ID);
        assert(response.data[0].accountId === user1_AccountID);
        assert(response.data[0].title === note1_Title);
        assert(response.data[0].body === note1_Body);
        assert(response.data[0].archive === note1_Archive);
        done();
      })
      .catch(function (error){
        console.log(error);
      })
    });

    it('logout user', function(done) {
      axiosInstance.post('users/logout', {
        token: user1_Token
      })
      .then(function (response) {
        console.log(response.status);
        console.log(response.data);
        assert(response.status === 200);
        assert(response.data = 'Ok');
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
