var targets = {};

targets.window = function(callback) {
  function handleMessage(evt) {
    if (evt && evt.data && evt.data.type === 'shareresult') {
      window.removeEventListener('message', handleMessage);

      if (evt.data.error) {
        return callback(new Error(evt.data.error.message || evt.data.error));
      }

      // pass the constraints through
      return callback(null, {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: evt.data.sourceId
          },

          optional: []
        }
      });
    }
  }

  window.addEventListener('message', handleMessage);
  window.postMessage({ device: 'window', src: 'page', type: 'share' }, '*');
};

module.exports = function(target, callback) {
  var capture = targets[target];

  if (typeof capture != 'function') {
    return callback(new Error(target + ' capture not implemented'));
  }

  return capture(callback);
};
