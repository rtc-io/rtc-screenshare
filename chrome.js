var detect = require('rtc-core/detect');
var extend = require('cog/extend');
var OPT_DEFAULTS = {
  target: 'rtc.io screenshare'
};
var REQUEST_OPTS = {
  targets: ['screen', 'window']
};
var CHROME_VERSION = getChromeVersion();

// Chrome >= 50 allows for greater sharing options
if (CHROME_VERSION >= 50) {
  REQUEST_OPTS.targets.push('tab');
}

/**
  Returns true if we should use Chrome screensharing
 **/
exports.supported = function() {
  return detect.browser === 'chrome';
}

/**
  Creates the share context.
 **/
exports.share = function(opts) {
  var extension = require('chromex/client')(extend({}, OPT_DEFAULTS, opts, {
    target: (opts || {}).chromeExtension
  }));

  extension.type = 'google/chrome';

  extension.available = function(callback) {
    return extension.satisfies((opts || {}).version, callback);
  };

  // patch in our capture function
  extension.request = function(callback) {
    extension.sendCommand('share', REQUEST_OPTS, function(err, sourceId) {
      if (err) {
        return callback(err);
      }

      if (! sourceId) {
        return callback(new Error('user rejected screen share request'));
      }

      // pass the constraints through
      return callback(null, extend({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            maxWidth: screen.width,
            maxHeight: screen.height,
            minFrameRate: 1,
            maxFrameRate: 5
          },
          optional: []
        }
      }, opts.constraints));
    });
  };

  extension.cancel = function() {
    extension.sendCommand('cancel', function(err) {
    });
  };

  return extension;
};

function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
  return raw ? parseInt(raw[2], 10) : -1;
}