/* jshint node: true */
'use strict';

var formatter = require('formatter');
var postMessage = formatter('window.postMessage("{{ 0 }}", "{{ 1 }}");');

function capture(tab) {
  console.log('clicked, we have tab: ', tab);
  chrome.tabs.executeScript({
    code: postMessage('hello', tab.url)
  });
}

chrome.browserAction.onClicked.addListener(capture);
