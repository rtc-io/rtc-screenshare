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
  media(constraints).render(document.body);
});

```

## Template Extension

Including in this repository is a template extension that interacts with the
[`chrome.desktopCapture`](https://developer.chrome.com/extensions/desktopCapture)
API, and communicates with this module through `postMessage` calls.

## License(s)

### Apache 2.0

Copyright 2014 Damon Oehlman <damon.oehlman@nicta.com.au>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
