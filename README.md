# rtc-screenshare

This is module provides a mechanism for integrating with the various
screen capture APIs exposed by the browser.  The module is designed to
interact with a browser extension (where required) to generate
suitable constraints that can be passed onto a `getUserMedia` call.


[![NPM](https://nodei.co/npm/rtc-screenshare.png)](https://nodei.co/npm/rtc-screenshare/)

[![experimental](https://img.shields.io/badge/stability-experimental-red.svg)](https://github.com/dominictarr/stability#experimental) 

## Example Usage

```js
var screenshare = require('rtc-screenshare');
var media = require('rtc-media');

screenshare.window(function(err, constraints) {
  if (err) {
    return console.error('Could not capture window: ', err);
  }

  console.log('attempting capture with constraints: ', constraints);
  media({ constraints: constraints })
    .on('error', function(err) {
      console.error('Could not capture: ', err);
    })
    .once('capture', function(stream) {
      console.log('Successfully captured stream: ', stream);
    })
    .render(document.body);
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

Once you have the plugin installed, you should be able to take the screenshare
module for a run using [requirebin](https://requirebin.com/?gist=6dcd5ced3964f0b3c40a)

This is, however, an early version of both the package and chrome extension so
we will be working through any
[issues](https://github.com/rtc-io/rtc-screenshare/issues) before removing
the __experimental__ status.

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
