var detect = require('rtc-core/detect');
var screenshare = (detect.moz ? require('./moz') : require('./chrome'));

/**
  # rtc-screenshare

**/

['window'].forEach(function(target) {
  screenshare[target] = function(callback) {
    return screenshare(target, callback);
  };
});

module.exports = screenshare;
