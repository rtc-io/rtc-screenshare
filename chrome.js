var extend = require('cog/extend');
var OPT_DEFAULTS = {
  target: 'rtc.io screenshare'
};

module.exports = function(opts) {
  var extension = require('chromex/client')(extend({}, OPT_DEFAULTS, opts, {
    target: (opts || {}).chromeExtension
  }));

  extension.available = function(callback) {
    return extension.satisfies((opts || {}).version, callback);
  };

  // patch in our capture function
  extension.request = function(callback) {
    extension.sendCommand('share', function(err, sourceId) {
      if (err) {
        return callback(err);
      }

      if (! sourceId) {
        return callback(new Error('user rejected screen share request'));
      }
      
      // pass the constraints through
      return callback(null, {
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
      });
    });
  };
  
  extension.cancel = function() {
    extension.sendCommand('cancel', function(err) {
    });
  };

  return extension;
};
