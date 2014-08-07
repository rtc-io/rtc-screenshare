var screenshare = require('..');
var media = require('rtc-media');

screenshare.window(function(err, constraints) {
  media(constraints).render(document.body);
});
