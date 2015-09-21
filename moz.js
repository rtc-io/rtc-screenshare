var detect = require('rtc-core/detect');
var EventEmitter = require('eventemitter3');
var targets = {};

targets.window = function(callback) {
  callback(null, {
    video: {
      mozMediaSource: 'window',
      mediaSource: 'window'
    }
  });
};

/**
  Returns true if we should use Firefox screensharing
 **/
exports.supported = function() {
  return detect.moz;
};

exports.share = function(opts) {
  opts = opts || {};
  var target = opts.target || 'window';
  var capture = targets[target];

  var extension = new EventEmitter();

  extension.type = 'mozilla/firefox';

  extension.available = function(callback) {
    if (typeof capture != 'function') {
      return callback(new Error(target + ' capture not implemented'), 'not-supported');
    }
    return callback();
  };

  extension.request = function(callback) {
    return capture(callback);
  };

  extension.cancel = function(callback) {

  };

  extension.emit('activate');

  return extension;
};