var detect = require('rtc-core/detect');

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

  We've created a simple demo showing how to broadcast your screen and made it
  available here at <https://rtc.io/screeny>
  ([source](https://github.com/rtc-io/demo-screenshare))

**/
module.exports = (detect.moz ? require('./moz') : require('./chrome'));
