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

  An early, installable version of the extension is available in the
  [Chrome Web Store](https://chrome.google.com/webstore/detail/webrtc-screen-sharing-for/einjngigaajacmojcohefgmnhhdnllic).

  __NOTE:__ The extension is not publicly available yet, but using the direct link
  you can install it.

  ## Give it a Try

  Once you have the plugin installed, you should be able to take the screenshare
  module for a run using [requirebin](http://requirebin.com/?gist=6dcd5ced3964f0b3c40a)

  This is, however, an early version of both the package and chrome extension so
  we will be working through any
  [issues](https://github.com/rtc-io/rtc-screenshare/issues) before removing
  the __experimental__ status.

**/

['window'].forEach(function(target) {
  screenshare[target] = function(callback) {
    return screenshare(target, callback);
  };
});

module.exports = screenshare;
