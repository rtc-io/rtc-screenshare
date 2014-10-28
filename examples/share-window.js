var screenshare = require('..');
var media = require('rtc-media');

screenshare(function(err, constraints) {
  if (err) {
    return console.error('Could not capture window: ', err);
  }

  console.log('attempting capture with constraints: ', constraints);
  media({ constraints: constraints })
    .on('error', function(err) {
      console.error('Could not capture: ', err);
    })
    .once('capture', function(stream) {
      console.log('Successfully captured stream: ', stream);
    })
    .render(document.body);
});
