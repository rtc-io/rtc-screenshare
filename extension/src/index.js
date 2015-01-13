var extend = require('cog/extend');
var extension = require('chromex')({
  manifest: require('./manifest.json')
});

// handle share events
extension.on('share', function(opts, port, callback) {
  var targets = (opts || {}).targets || ['window', 'screen'];

  console.log('received share request');

  chrome.desktopCapture.chooseDesktopMedia(targets, port.sender.tab, function(id) {
    if (chrome.runtime.lastError) {
      return callback({ error: chrome.runtime.lastError });
    }

    console.log('success - stream id: ', id);
    callback(null, id);
  });
});
