var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String,
    deviceID: String,
    phoneNum: String,
    doorOpen: Boolean,
    haveMail: Boolean,
    smsEnable: Boolean
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('accounts', Account);
