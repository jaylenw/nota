var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Task = new Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    archive: {
        type: Boolean,
        default: false
    },
    date: {
      type: Date,
      default: Date.now()
    }
});

mongoose.model('Task', Task);
