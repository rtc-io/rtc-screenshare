var screenshare = require('../');
var media = require('rtc-media');

screenshare(['window', 'tab'], function(err, stream) {
  console.log(err, stream);
});