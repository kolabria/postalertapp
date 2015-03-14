var mqtt = require('mqtt')

// twilio sms api
var accountSid = 'AC0cbdfd8793aa558c6a9a10c05f9fb269';
var authToken = '898dd02e362b3c3b579b16f7a066dba9';
var smsClient = require('twilio')(accountSid, authToken);




var client = mqtt.connect({  host:'66.175.213.139', port: 1883});

client.subscribe('spoutTopic');
client.subscribe('spoutTopic/2');
client.subscribe('spoutTopic/3');
//client.publish('presence', 'Hello mqtt');

client.on('message', function (topic, message) {
  console.log(message);
  var smsMsg = 'Sensor Mesage: '+topic+'-'+message;
        //Send an SMS text message
        smsClient.sendMessage({

            to:'+15144497338', // Any number Twilio can deliver to
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


});

//client.end();