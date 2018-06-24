var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    email: {
        type: String
    },
    password: {
        type: String
    },
    salt: {
        type: String
    },
    reset_token: {
        type: String
    }
});

mongoose.model('User', User);
