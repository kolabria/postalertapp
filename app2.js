// example app from mqtt.js modified to work with own server

var mqtt    = require('mqtt');
var host = '66.175.213.139';
var client  = mqtt.connect({ host: '66.175.213.139', port: 1883 });
 
client.on('connect', function () {
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
  //client.end();
});