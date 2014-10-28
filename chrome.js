module.exports = function(opts, callback) {
  var targets;

  // remap args
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  // get the target
  targets = (opts || {}).targets || ['window', 'screen'];

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
            chromeMediaSourceId: evt.data.sourceId,
            maxWidth: screen.width,
            maxHeight: screen.height,
            minFrameRate: 1,
            maxFrameRate: 5
          },

          optional: []
        }
      });
    }
  }

  window.addEventListener('message', handleMessage);
  window.postMessage({ targets: targets, src: 'page', type: 'share' }, '*');
};
