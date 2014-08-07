var media = require('rtc-media');
var config = require('rtc-captureconfig');

media(config('share:window')).render(document.body);
