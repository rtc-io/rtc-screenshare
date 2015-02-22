# rtc-screenshare

This is module provides a mechanism for integrating with the various
screen capture APIs exposed by the browser.  The module is designed to
interact with a browser extension (where required) to generate
suitable constraints that can be passed onto a `getUserMedia` call.


[![NPM](https://nodei.co/npm/rtc-screenshare.png)](https://nodei.co/npm/rtc-screenshare/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/dominictarr/stability#experimental) 

## Example Usage

```js
var media = require('rtc-media');
var h = require('hyperscript');
var crel = require('crel');
var screenshare = require('rtc-screenshare')({
  chromeExtension: 'rtc.io screenshare',
  version: '^1.0.0'
});

var buttons = {
  install: h('button', 'Install Extension', { onclick: function() {
    chrome.webstore.install();
  }}),

  capture: h('button', 'Capture Screen', { onclick: shareScreen })
};

function shareScreen() {
  screenshare.request(function(err, constraints) {
    if (err) {
      return console.error('Could not capture window: ', err);
    }

    console.log('attempting capture with constraints: ', constraints);
    media({
      constraints: constraints,
      target: document.getElementById('main')
    });
  });
}

// detect whether the screenshare plugin is available and matches
// the required version
screenshare.available(function(err, version) {
  var actions = document.getElementById('actions');

  if (err) {
    return actions.appendChild(buttons.install);
  }

  actions.appendChild(buttons.capture);
});

// on install show the capture button and remove the install button if active
screenshare.on('activate', function() {
  if (buttons.install.parentNode) {
    buttons.install.parentNode.removeChild(buttons.install);
  }

  document.getElementById('actions').appendChild(buttons.capture);
});

```

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

## License(s)

### Apache 2.0

Copyright 2014 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
