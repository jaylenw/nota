const chai = require('chai');
const assert = chai.assert;
const axios = require('axios');
const moment = require('moment');
const app = require('../app.js');
const db = require('../services/db');
const cleanDB = require('./clean/drop_db.js');
const config = require('config');
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

	let axiosInstance = axios.create({
		baseURL: 'http://0.0.0.0:3000',
		timeout: 1000
	});

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
				});
		});

		it('register user (email used again)', function(done) {
			axiosInstance.post('/users/register', {
				email: user1_Email,
				password: user1_Password
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 409);
					assert(error.response.data.msg === 'Email taken!');
					done();
				});
		});

		it('register user (invalid email address)', function(done) {
			axiosInstance.post('/users/register', {
				email: 'test@!@#.com',
				password: user1_Password
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 406);
					assert(error.response.data.msg === 'Email is not valid!');
					done();
				});
		});

		it('register user (no password)', function(done) {
			axiosInstance.post('/users/register', {
				email: user1_Email,
				password: ''
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		it('register user (no email address)', function(done) {
			axiosInstance.post('/users/register', {
				email: '',
				password: user1_Password
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
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
				});
		});

		it('create first note (no title or body)', function(done) {
			axiosInstance.post('/tasks', {
				token: user1_Token
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.data === 'Precondition failed. Required: title, body.');
					done();
				});
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
				});
		});

		it('edit first note (no user token)', function(done) {
			axiosInstance.put('/tasks/' + note1_ID, {
				title: note1_Title,
				body: note1_Body,
				archive: note1_Archive
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error);
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
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
				});
		});

		it('get all tasks (no user token)', function(done) {
			axiosInstance.get('/tasks?token=')
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		it('delete first note', function(done) {
			axiosInstance.delete('/tasks/' + note1_ID + '?token=' + user1_Token)
				.then(function (response) {
					console.log(response.status);
					console.log(response.data);
					assert(response.status === 200);
					assert(response.data === 'ok');
					done();
				})
				.catch(function (error){
					console.log(error);
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
				});
		});

		it('login user (no email address)', function(done) {
			axiosInstance.post('/users/login', {
				email: '',
				password: user1_Password
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		it('login user (no password)', function(done) {
			axiosInstance.post('/users/login', {
				email: user1_Email,
				password: ''
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		it('login user (incorrect email address)', function(done) {
			axiosInstance.post('/users/login', {
				email: 'bad@bad.com',
				password: user1_Password
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 401);
					assert(error.response.data.msg === 'Wrong email!');
					done();
				});
		});

		it('login user', function(done) {
			axiosInstance.post('/users/login', {
				email: user1_Email,
				password: user1_Password
			})
				.then(function (response) {
					console.log(response.status);
					console.log(response.data);
					assert(response.status === 200);
					assert.exists(response.data.token);
					done();
				})
				.catch(function (error){
					console.log(error);
				});
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
				});
		});

		it('forgot user password', function(done) {
			axiosInstance.post('users/forgot', {
				email: user1_Email
			})
				.then(function (response) {
					console.log(response.status);
					console.log(response.data);
					assert(response.status === 200);
					assert(response.data.msg = 'success. Email has been sent to your address');
					done();
				})
				.catch(function (error){
					console.log(error);
				});
		});

		it('forgot user password (no email provided)', function(done) {
			axiosInstance.post('users/forgot', {
				email: ''
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error);
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		// for user1
		it('reset user password', function(done) {
			axiosInstance.post('users/reset/' + user1_Email, {
				reset_token: '1111',
				password: 'newPass'
			})
				.then(function (response) {
					console.log(response.status);
					console.log(response.data);
					assert(response.status === 200);
					assert(response.data.msg = 'success. Password has been changed');
					done();
				})
				.catch(function (error){
					console.log(error);
				});
		});

		it('reset user password (empty reset token)', function(done) {
			axiosInstance.post('users/reset/' + user1_Email, {
				reset_token: '',
				password: 'newPass'
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error);
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
				});
		});

		it('reset user password (empty password)', function(done) {
			axiosInstance.post('users/reset/' + user1_Email, {
				reset_token: '1111',
				password: ''
			})
				.then(function (response) {
					return;
				})
				.catch(function (error){
					console.log(error);
					console.log(error.response.status);
					console.log(error.response.data);
					assert(error.response.status === 412);
					assert(error.response.data.msg === 'Route requisites not met.');
					done();
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
			axiosInstance.post('/users/login', {
				email: user1_Email,
				password: 'newPass'
			})
				.then(function (response) {
					console.log(response.status);
					console.log(response.data);
					assert(response.status === 200);
					assert.exists(response.data.token);
					done();
				})
				.catch(function (error){
					console.log(error);
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
