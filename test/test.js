const chai = require('chai');
const assert = chai.assert;
const axios = require('axios');
const request = require('supertest');
const moment = require('moment');
const app = require('../app.js');
const db = require('../services/db');
const cleanDB = require('./clean/drop_db.js');
const config = require('config');
const { expect } = require('chai');
const { response } = require('express');
let server;

let user1_Token = '';
let user1_Email = config.get('test_email');
let user1_Password = 'test123';
let user1_AccountID = '';

let note1_Title = 'note 1 title';
let note1_Body = 'note 1 body';
let note1_ID = '';
let note1_Archive = false;

before(function(done) {
	this.timeout(0); // disable mocha's default timeout
	db.verifiedConnectionToDB().then(function() {
		server = app.listen(3000, done);
	}).catch(function() {
		console.log('Exiting as DB connection could not be established.');
		process.exit(1);
	});
});

describe('nota tests', function() {

	describe('user & tasks tests', function() {

		it('register user', function(done) {
			request(app)
				.post('/users/register')
				.send({ email: user1_Email, password: user1_Password })
				.expect(201)
				.then(response => {
					assert.exists(response.body.token);
					user1_Token = response.body.token;
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('register user (email used again)', function(done) {
			request(app)
				.post('/users/register')
				.send({ email: user1_Email, password: user1_Password })
				.expect(409)
				.then(response => {
					assert(response.body.msg === 'Email taken!');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('register user (invalid email address)', function(done) {
			request(app)
				.post('/users/register')
				.send({ email: 'test@!@#.com', password: user1_Password })
				.expect(406)
				.then(response => {
					assert(response.body.msg === 'Email is not valid!');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('register user (no password)', function(done) {
			request(app)
				.post('/users/register')
				.send({ email: user1_Email, password: '' })
				.expect(412)
				.then(response => {
					assert(response.body.msg === 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('register user (no email address)', function(done) {
			request(app)
				.post('/users/register')
				.send({ email: '', password: user1_Password })
				.expect(412)
				.then(response => {
					assert(response.body.msg === 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('create first note', function(done) {
			request(app)
				.post('/tasks')
				.send({ token: user1_Token, title: note1_Title, body: note1_Body })
				.expect(201)
				.then(response => {
					assert(response.body.title === note1_Title);
					assert(response.body.body === note1_Body);
					assert(response.body.archive === note1_Archive);
					assert.exists(response.body._id);
					assert.exists(response.body.accountId);
					assert(moment(response.body.date).isValid());
					note1_ID = response.body._id;
					user1_AccountID = response.body.accountId;
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('create first note (no title or body)', function(done) {
			request(app)
				.post('/tasks')
				.send({ token: user1_Token })
				.expect(412)
				.then(response => {
					assert(response.text === 'Precondition failed. Required: title, body.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('edit first note', function(done) {
			
			note1_Title = note1_Title + ' plus edited';
			note1_Body = note1_Body + ' plus edited';
			note1_Archive = true;

			request(app)
				.put('/tasks/' + note1_ID)
				.send({ token: user1_Token, title: note1_Title, body: note1_Body, archive: note1_Archive })
				.expect(204)
				.then(response => {
					assert(response.text === '');
					done();
				})
				.catch(err => {
					console.log(err);
				});
		});

		it('edit first note (no user token)', function(done) {
			request(app)
				.put('/tasks/' + note1_ID)
				.send({ title: note1_Title, body: note1_Body, archive: note1_Archive })
				.expect(412)
				.then(response => {
					assert(response.body.msg === 'Route requisites not met.');
					done();
				});
		});


		// come back to, need to improve the error response (created issue for this)
		// it('edit first note (invalid note id)', function(done) {
		//   axiosInstance.put('/tasks/1111', {
		//     token: user1_Token,
		//     title: note1_Title,
		//     body: note1_Body,
		//     archive: note1_Archive
		//   })
		//   .then(function (response) {
		//     return;
		//   })
		//   .catch(function (error){
		//     console.log(error);
		//     console.log(error.response.status);
		//     console.log(error.response.data);
		//     assert(error.response.status === 404);
		//     assert(error.response.data.msg === 'No task with that ID found in your account.');
		//     done();
		//   })
		// });

		it('get all tasks', function(done) {
			request(app)
				.get('/tasks?token=' + user1_Token)
				.expect(200)
				.then(response => {
					assert(response.body[0]._id === note1_ID);
					assert(response.body[0].accountId === user1_AccountID);
					assert(response.body[0].title === note1_Title);
					assert(response.body[0].body === note1_Body);
					assert(response.body[0].archive === note1_Archive);
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('get all tasks (no user token)', function(done) {
			request(app)
				.get('/tasks?token=')
				.expect(412)
				.then(response => {
					assert(response.body.msg === 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('delete first note', function(done) {
			request(app)
				.delete('/tasks/' + note1_ID + '?token=' + user1_Token)
				.expect(200)
				.then(response => {
					assert(response.body === 'ok');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		// come back to, need to improve the error response (created issue for this)
		// it('delete first note (invalid note id)', function(done) {
		//   axiosInstance.delete('/tasks/1111' + '?token=' + user1_Token)
		//   .then(function (response) {
		//     return;
		//   })
		//   .catch(function (error){
		//     console.log(error);
		//     console.log(error.response.status);
		//     console.log(error.response.data);
		//     assert(error.response.status === 404);
		//     assert(error.response.data.msg === 'No task with that ID found in your account.');
		//     done();
		//   })
		// });

		it('logout user', function(done) {
			request(app)
				.post('/users/logout')
				.send({ token: user1_Token })
				.expect(200)
				.then(response => {
					assert(response.body = 'Ok');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('login user (no email address)', function(done) {
			request(app)
				.post('/users/login')
				.send({ email: '', password: user1_Password })
				.expect(412)
				.then(response => {
					assert(response.body.msg = 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('login user (no password)', function(done) {
			request(app)
				.post('/users/login')
				.send({ email: user1_Email, password: '' })
				.expect(412)
				.then(response => {
					assert(response.body.msg = 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('login user (incorrect email address)', function(done) {
			request(app)
				.post('/users/login')
				.send({ email: 'bad@bad.com', password: user1_Password })
				.expect(401)
				.then(response => {
					assert(response.body.msg = 'Wrong email!');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('login user', function(done) {
			request(app)
				.post('/users/login')
				.send({ email: user1_Email, password: user1_Password })
				.expect(200)
				.then(response => {
					assert.exists(response.body.token);
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('logout user', function(done) {
			request(app)
				.post('/users/logout')
				.send({ token: user1_Token })
				.expect(200)
				.then(response => {
					assert(response.body = 'Ok');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('forgot user password', function(done) {
			request(app)
				.post('/users/forgot')
				.send({ email: user1_Email })
				.expect(200)
				.then(response => {
					assert(response.body.msg = 'success. Email has been sent to your address');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('forgot user password (no email provided)', function(done) {
			request(app)
				.post('/users/forgot')
				.send({ email: '' })
				.expect(412)
				.then(response => {
					assert(response.body.msg = 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		// for user1
		it('reset user password', function(done) {
			request(app)
				.post('/users/reset/' + user1_Email)
				.send({ reset_token: '1111', password: 'newPass' })
				.expect(200)
				.then(response => {
					assert(response.body.msg = 'success. Password has been changed');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('reset user password (empty reset token)', function(done) {
			request(app)
				.post('/users/reset/' + user1_Email)
				.send({ reset_token: '', password: 'newPass' })
				.expect(412)
				.then(response => {
					assert(response.body.msg = 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		it('reset user password (empty password)', function(done) {
			request(app)
				.post('/users/reset/' + user1_Email)
				.send({ reset_token: '1111', password: '' })
				.expect(412)
				.then(response => {
					assert(response.body.msg = 'Route requisites not met.');
					done();
				}).catch(err => {
					console.log(err);
				});
		});

		// below makes us realize that when a invalid route is hit
		// we need to have a better respose error
		// it('reset user password (no email)', function(done) {
		//   axiosInstance.post('users/reset/', {
		//     reset_token: '1111',
		//     password: 'newPass'
		//   })
		//   .then(function (response) {
		//     return
		//   })
		//   .catch(function (error){
		//     console.log(error);
		//     assert(error.response.status === 404);
		//     done();
		//   })
		// });

		it('login user', function(done) {
			request(app)
				.post('/users/login')
				.send({ email: user1_Email, password: 'newPass' })
				.expect(200)
				.then(response => {
					assert.exists(response.body.token);
					done();
				}).catch(err => {
					console.log(err);
				});
		});
	});
});

after(function(done) {
	cleanDB()
	.then(function() {
		server.close(function() {
			console.log('Application closed.');
			return done();
		});
	});
});
