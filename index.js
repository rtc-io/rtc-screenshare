/* jshint node: true */
'use strict';

var flashlite = require('./lib/flashlite');

/**
  # rtc-screenshare

  This is a screensharing extension that is designed to work in conjunction
  with the rtc-media library.

  ## Icon Attribution

  This extension uses the following
  [CC BY 3.0](http://creativecommons.org/licenses/by/3.0/us/) icons:

  - [Monitor](http://thenounproject.com/term/monitor/8207/) by
    [Maurizio Fusillo](http://thenounproject.com/fusillomaurizio/)

**/

module.exports = function(target, callback) {
  var flash = flashlite();

  flash('you need to share');

  window.addEventListener('message', function(evt) {
    console.log('received message: ', evt);
  });
};