(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9kb2VobG1hbi8uYmFzaGluYXRlL2luc3RhbGwvbm9kZS8wLjEwLjI2L2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9ydGMuaW8vc2NyZWVuc2hhcmUvY2hyb21lLWV4dGVuc2lvbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gaGFuZGxlUmVxdWVzdChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAvLyBpZiB3ZSBoYXZlIGhhZCBhIGRldmljZSByZXF1ZXN0ZWQsIHRoZW4gY2FwdHVyZSB0aGF0IGRldmljZSBhbmRcbiAgLy8gc2VuZCB0aGUgZGV2aWNlaWQgYmFjayBpbiB0aGUgcmVzcG9uc2VcbiAgaWYgKHJlcXVlc3QuZGV2aWNlKSB7XG4gICAgY2FwdHVyZShyZXF1ZXN0LmRldmljZSwgc2VuZFJlc3BvbnNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYXB0dXJlKHRhcmdldCwgY2FsbGJhY2spIHtcbiAgdmFyIHRhcmdldHMgPSBbXS5jb25jYXQodGFyZ2V0IHx8IFtdKTtcblxuICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBjbGlja3Mgb24gdGhlIGJyb3dzZXIgYWN0aW9uLlxuICBjaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24odGFiKSB7XG4gICAgY2hyb21lLmRlc2t0b3BDYXB0dXJlLmNob29zZURlc2t0b3BNZWRpYSh0YXJnZXRzLCB0YWIsIGZ1bmN0aW9uKGlkKSB7XG4gICAgICBjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xuICAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3NmdWxseSBjYXB0dXJlZCBkZXZpY2U6ICcsIGlkKTtcbiAgICAgIGNhbGxiYWNrKHsgZGV2aWNlSWQ6IGlkIH0pO1xuICAgIH0pXG5cbiAgfSk7XG5cbiAgY2hyb21lLnRhYnMucXVlcnkoe2FjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZX0sIGZ1bmN0aW9uKHRhYnMpIHtcbiAgICBjb25zb2xlLmxvZyh0YXJnZXRzLCB0YWJzWzBdKTtcbiAgICBjaHJvbWUuZGVza3RvcENhcHR1cmUuY2hvb3NlRGVza3RvcE1lZGlhKHRhcmdldHMsIHRhYnNbMF0sIGZ1bmN0aW9uKGlkKSB7XG4gICAgICBjb25zb2xlLmxvZyhhcmd1bWVudHMpO1xuICAgICAgY29uc29sZS5sb2coJ3N1Y2Nlc3NmdWxseSBjYXB0dXJlZCBkZXZpY2U6ICcsIGlkKTtcbiAgICAgIGNhbGxiYWNrKHsgZGV2aWNlSWQ6IGlkIH0pO1xuICAgIH0pXG4gIH0pO1xufVxuXG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoaGFuZGxlUmVxdWVzdCk7XG4iXX0=
