var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var mqtt = require('mqtt')
var Account = require('./models/account');

// twilio sms api
var accountSid = 'AC0cbdfd8793aa558c6a9a10c05f9fb269';
var authToken = '898dd02e362b3c3b579b16f7a066dba9';
var smsClient = require('twilio')(accountSid, authToken);

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// passport config
var Account = require('./models/account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
mongoose.connect('mongodb://localhost/postalert-test1');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var client  = mqtt.connect({ host: '66.175.213.139', port: 1883 });
 
client.on('connect', function () {
  client.subscribe('DID/#');
  client.publish('presence', 'Hello mqtt');
});
 
client.on('message', function (topic, message) {
    
  // message is Buffer 
    console.log("topic:", topic);
    var topicArray = topic.split("/");
    console.log("Device ID:", topicArray[1]);
    if (topicArray[0] == 'DID'){  // check if message from device
        // find account that has registered this device
        Account.findOne({deviceID: topicArray[1]},function(err,account){
            if (err) console.log(err);
            if (account){
               // console.log("mqtt Account: ",accounts);
            //    console.log("topic3: ",topicArray[2]);
                switch (topicArray[2]) {
                    case 'door':
                        console.log("Received mqtt door message");
                        if (message == 'open'){
                            if (account.phoneNum)
                              sendTxtMessage(account.phoneNum,'Your Mailbox door has been opened');
                            account.doorOpen = true;
                            account.save(function(err) {
                            	  if (err) console.log('failed to device door status',err);
                            	});                           
                        }
                        else if (message == 'close'){
                            account.doorOpen = false;
                            account.save(function(err) {
                            	  if (err) console.log('failed to device door status',err);
                            	});
                        }
                        break;
                    case 'mail':
                        console.log("Received mqtt mail message");
                        if (message == 'true'){
                            if (account.phoneNum)
                              sendTxtMessage(account.phoneNum,'Your Have Mail');
                            account.haveMail = true;
                            account.save(function(err) {
                            	  if (err) console.log('failed to device door status',err);
                            	});                           
                        }
                        else if (message == 'false'){
                            account.haveMail = false;
                            account.save(function(err) {
                            	  if (err) console.log('failed to device door status',err);
                            	});
                        }
                        break;                     
                    default:
                           console.log("Received unknown mqtt message");
                         
                }
                     
                
            }
            else
                console.log("mqtt Message: no account found");
        })
    
        
        
    }
    

    
  console.log(message.toString());
  //client.end();
});

function sendTxtMessage(number, message){
    var smsMsg = 'PostAlert Mesage: ' + message;
    number = '+1' + number;
          //Send an SMS text message
    smsClient.sendMessage({
              to: number , // Any number Twilio can deliver to
              from: '+14387950325', // A number you bought from Twilio and can use for outbound communication
              body: smsMsg // body of the SMS message

          }, function(err, responseData) { //this function is executed when a response is received from Twilio

              if (!err) { // "err" is an error received during the request, if any

                  // "responseData" is a JavaScript object containing data received from Twilio.
                  // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                  // http://www.twilio.com/docs/api/rest/sending-sms#example-1

                  console.log(" Error");
                  console.log(responseData.from); // outputs "+14506667788"
                  console.log(responseData.body); // outputs "word to your mother."

              }
          }); 
}




module.exports = app;
