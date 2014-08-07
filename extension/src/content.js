/* jshint node: true */
'use strict';

var extend = require('cog/extend');

function handleMessage(evt) {
  if (evt.data && evt.data.src === 'page') {
    // make a request to the runtime
    chrome.runtime.sendMessage(evt.data, function(response) {
      window.postMessage(extend(response, { src: 'extension' }, '*'));
    });
  }
}

chrome.runtime.onMessage.addListener(function(data, sender) {
  if (sender.tab) {
    return;
  }

  window.postMessage(extend(data, { src: 'extension' }), '*');
});

window.addEventListener('message', handleMessage);
