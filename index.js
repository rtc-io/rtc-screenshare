/**
  # rtc-screenshare

  This is module provides a mechanism for integrating with the various
  screen capture APIs exposed by the browser.  The module is designed to
  interact with a browser extension (where required) to generate
  suitable constraints that can be passed onto a `getUserMedia` call.

  ## Example Usage

  <<< examples/share-window.js

  ## Template Extension

  Template extension
  [source is available](https://github.com/rtc-io/rtc-screenshare-extension) and
  an early, installable version of the extension is available in the
  [Chrome Web Store](https://chrome.google.com/webstore/detail/webrtc-screen-sharing-for/einjngigaajacmojcohefgmnhhdnllic).

  __NOTE:__ The extension is not publicly available yet, but using the direct link
  you can install it.

  ## Give it a Try

  We've created a simple demo showing how to broadcast your screen and made it
  available here at <https://rtc.io/screeny/>
  ([source](https://github.com/rtc-io/demo-screenshare)).

**/
module.exports = function() {
  console.error('Screensharing is not supported on this device');
};

var handlers = [require('./chrome'), require('./moz')];
for (var i = 0; i < handlers.length; i++) {
  var handler = handlers[i];
  if (handler && handler.supported()) {
    module.exports = handler.share;
    break;
  }
}