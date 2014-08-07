(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* jshint node: true */
'use strict';

var extend = require('cog/extend');

function handleRequest(request, sender, sendResponse) {
  // if we have had a device requested, then capture that device and
  // send the deviceid back in the response
  if (request.type === 'share') {
    capture(request.device, sender, sendResponse);
  }
}

function capture(target, sender, callback) {
  var targets = [].concat(target || []);

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

},{"cog/extend":2}],2:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/extend

```js
var extend = require('cog/extend');
```

### extend(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed:

```js
extend({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      target[prop] = source[prop];
    }
  });

  return target;
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2RvZWhsbWFuLy5iYXNoaW5hdGUvaW5zdGFsbC9ub2RlLzAuMTAuMjkvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL3J0Yy5pby9zY3JlZW5zaGFyZS9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvcnRjLmlvL3NjcmVlbnNoYXJlL25vZGVfbW9kdWxlcy9jb2cvZXh0ZW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcblxuZnVuY3Rpb24gaGFuZGxlUmVxdWVzdChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAvLyBpZiB3ZSBoYXZlIGhhZCBhIGRldmljZSByZXF1ZXN0ZWQsIHRoZW4gY2FwdHVyZSB0aGF0IGRldmljZSBhbmRcbiAgLy8gc2VuZCB0aGUgZGV2aWNlaWQgYmFjayBpbiB0aGUgcmVzcG9uc2VcbiAgaWYgKHJlcXVlc3QudHlwZSA9PT0gJ3NoYXJlJykge1xuICAgIGNhcHR1cmUocmVxdWVzdC5kZXZpY2UsIHNlbmRlciwgc2VuZFJlc3BvbnNlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjYXB0dXJlKHRhcmdldCwgc2VuZGVyLCBjYWxsYmFjaykge1xuICB2YXIgdGFyZ2V0cyA9IFtdLmNvbmNhdCh0YXJnZXQgfHwgW10pO1xuXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHthY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWV9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHsgZXJyb3I6IGNocm9tZS5ydW50aW1lLmxhc3RFcnJvciB9KTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIGNhbGxiYWNrIHRvIGRpcmVjdGx5IHNlbmQgdGhlIG1lc3NhZ2UgdG8gdGhlIGNhbGxpbmcgdGFiXG4gICAgY2FsbGJhY2sgPSBmdW5jdGlvbihwYXlsb2FkKSB7XG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCBleHRlbmQocGF5bG9hZCwgeyB0eXBlOiAnc2hhcmVyZXN1bHQnIH0pKTtcbiAgICB9O1xuXG4gICAgY2hyb21lLmRlc2t0b3BDYXB0dXJlLmNob29zZURlc2t0b3BNZWRpYSh0YXJnZXRzLCB0YWJzWzBdLCBmdW5jdGlvbihpZCkge1xuICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soeyBlcnJvcjogY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIH0pO1xuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayh7IHNvdXJjZUlkOiBpZCB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihoYW5kbGVSZXF1ZXN0KTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuIyMgY29nL2V4dGVuZFxuXG5gYGBqc1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcbmBgYFxuXG4jIyMgZXh0ZW5kKHRhcmdldCwgKilcblxuU2hhbGxvdyBjb3B5IG9iamVjdCBwcm9wZXJ0aWVzIGZyb20gdGhlIHN1cHBsaWVkIHNvdXJjZSBvYmplY3RzICgqKSBpbnRvXG50aGUgdGFyZ2V0IG9iamVjdCwgcmV0dXJuaW5nIHRoZSB0YXJnZXQgb2JqZWN0IG9uY2UgY29tcGxldGVkOlxuXG5gYGBqc1xuZXh0ZW5kKHsgYTogMSwgYjogMiB9LCB7IGM6IDMgfSwgeyBkOiA0IH0sIHsgYjogNSB9KSk7XG5gYGBcblxuU2VlIGFuIGV4YW1wbGUgb24gW3JlcXVpcmViaW5dKGh0dHA6Ly9yZXF1aXJlYmluLmNvbS8/Z2lzdD02MDc5NDc1KS5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLmZvckVhY2goZnVuY3Rpb24oc291cmNlKSB7XG4gICAgaWYgKCEgc291cmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiB0YXJnZXQ7XG59OyJdfQ==
