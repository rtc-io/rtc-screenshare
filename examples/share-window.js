var screenshare = require('../');
var media = require('rtc-media');
var config = require('rtc-captureconfig');

media(config('share:window'))
  .on('capture', function(stream) {
    console.log('captured stream: ', stream);
  })
  .render(document.body);
