/* jshint node: true */
'use strict';

var extend = require('cog/extend');

function handleRequest(request, sender, sendResponse) {
  // if we have had a device requested, then capture that device and
  // send the deviceid back in the response
  if (request.type === 'share') {
    capture(request.targets, sender, sendResponse);
  }
}

function capture(targets, sender, callback) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (chrome.runtime.lastError) {
      return callback({ error: chrome.runtime.lastError });
    }

    // update the callback to directly send the message to the calling tab
    callback = function(payload) {
      chrome.tabs.sendMessage(tabs[0].id, extend(payload, { type: 'shareresult' }));
    };

    chrome.desktopCapture.chooseDesktopMedia(targets, tabs[0], function(id) {
      if (chrome.runtime.lastError) {
        return callback({ error: chrome.runtime.lastError });
      }

      callback({ sourceId: id });
    });
  });
}

chrome.runtime.onMessage.addListener(handleRequest);
