var detect = require('rtc-core/detect');
var screenshare = (detect.moz ? require('./moz') : require('./chrome'));

/**
  # rtc-screenshare

  This is module provides a mechanism for integrating with the various
  screen capture APIs exposed by the browser.  The module is designed to
  interact with a browser extension (where required) to generate
  suitable constraints that can be passed onto a `getUserMedia` call.

  ## Example Usage

  <<< examples/share-window.js

  ## Template Extension

  Including in this repository is a template extension that interacts with the
  [`chrome.desktopCapture`](https://developer.chrome.com/extensions/desktopCapture)
  API, and communicates with this module through `postMessage` calls.

**/

['window'].forEach(function(target) {
  screenshare[target] = function(callback) {
    return screenshare(target, callback);
  };
});

module.exports = screenshare;
