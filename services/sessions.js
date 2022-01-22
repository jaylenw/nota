const mongoose = require('mongoose'),
	crypto = require('crypto'),
	Session = mongoose.model('Session');

//Checks if a token exists, and returns the corrosponding accountId
exports.validateSession = function(token, type, success, fail) {
	let query;
	if(typeof type == 'string'){
		query = {
			token: {$eq: token},
			type: type
		};
	} else {
		query = {
			token: {$eq: token},
			type: { $in : type }
		};
	}
	Session.findOne(query)
		.select('accountId type')
		.exec(function(err, session) {
			if (err) {
				fail({
					msg: 'Could not search database for session!',
					status: 500
				});
			} else if (!session) {
				fail({
					msg: 'Session is not valid!',
					status: 401
				});
			} else {
				success(session.accountId, session);
			}
		});
};

//Creates a token and returns the token if successful
exports.generateSession = function(accountId, type, success, fail) {
	//Create a random token
	let token = crypto.randomBytes(48).toString('hex');
	//New session!
	new Session({
		accountId: accountId,
		type: type,
		token: token,
		created: Date.now()
	}).save(function(err) {
		if (err) {
			fail({
				msg: 'Could not add session to DB!',
				status: 500
			});
		} else {
			success(token);
		}
	});
};

//Creates a token and returns the token if successful
exports.deleteSession = function(token, success, fail) {
	Session.findOne({
		token: {$eq: token}
	}).deleteOne(function(err){
		if(err) fail(err);
		else success();
	});
};
