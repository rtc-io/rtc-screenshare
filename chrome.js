var extend = require('cog/extend');
var OPT_DEFAULTS = {
  target: 'rtc.io screenshare'
};

module.exports = function(opts) {
  var lastRequestId;
  var extension = require('chromex/client')(extend({}, OPT_DEFAULTS, opts, {
    target: (opts || {}).chromeExtension
  }));

  extension.available = function(callback) {
    return extension.satisfies((opts || {}).version, callback);
  };

  // patch in our capture function
  extension.request = function(callback) {
    extension.sendCommand('share', function(err, sourceId, requestId) {
      if (err) {
        return callback(err);
      }

      if (! sourceId) {
        return callback(new Error('user rejected screen share request'));
      }
      
      // update the last requestId
      lastRequestId = requestId;

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
  
  extension.cancel = function(requestId) {
    var opts = {
      requestId: requestId || lastRequestId
    };

    extension.sendCommand('cancel', opts, function(err) {
    });
  };

  return extension;
};
