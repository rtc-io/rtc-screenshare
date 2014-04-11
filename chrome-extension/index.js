/* jshint node: true */
'use strict';

function handleRequest(request, sender, sendResponse) {
  // if we have had a device requested, then capture that device and
  // send the deviceid back in the response
  if (request.device) {
    capture(request.device, sendResponse);
  }
}

function capture(target, callback) {
  var targets = [].concat(target || []);

  // Called when the user clicks on the browser action.
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.desktopCapture.chooseDesktopMedia(targets, tab, function(id) {
      console.log(arguments);
      console.log('successfully captured device: ', id);
      callback({ deviceId: id });
    })

  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    console.log(targets, tabs[0]);
    chrome.desktopCapture.chooseDesktopMedia(targets, tabs[0], function(id) {
      console.log(arguments);
      console.log('successfully captured device: ', id);
      callback({ deviceId: id });
    })
  });
}

chrome.runtime.onMessage.addListener(handleRequest);
