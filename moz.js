var targets = {};

targets.window = function(callback) {
  callback(null, {
    audio: false,
    video: {
      mozMediaSource: 'window',
      mediaSource: 'window'
    }
  });
};

module.exports = function(target, callback) {
  var capture = targets[target];

  if (typeof capture != 'function') {
    return callback(new Error(target + ' capture not implemented'));
  }

  return capture(callback);
};
