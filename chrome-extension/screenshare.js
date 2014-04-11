(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"formatter":2}],2:[function(require,module,exports){
/* jshint node: true */
'use strict';

var reVariable = /\{\{\s*([^\}]+?)\s*\}\}/;
var mods = require('./mods');

/**
  # formatter

  This is a simple library designed to do one thing and one thing only -
  replace variables in strings with variable values.  It is built in such a
  way that the formatter strings are parsed and you are provided with a
  function than can efficiently be called to provide the custom output.

  ## Example Usage

  <<< examples/likefood.js

  __NOTE__: Formatter is not designed to be a templating library and if
  you are already using something like Handlebars or
  [hogan](https://github.com/twitter/hogan.js) in your library or application
  stack consider using them instead.

  ## Using named variables

  In the examples above we saw how the formatter can be used to replace
  function arguments in a formatter string.  We can also set up a formatter
  to use particular key values from an input string instead if that is more
  suitable:

  <<< examples/likefood-named.js

  ## Nested Property Values

  Since version `0.1.0` you can also access nested property values, as you
  can with templates like handlebars.

  ## Partial Execution

  Since version `0.3.x` formatter also supports partial execution when using
  indexed arguments (e.g. `{{ 0 }}`, `{{ 1 }}`, etc).  For example:

  <<< examples/partial.js

  In the case above, the original formatter function returned by `formatter`
  did not receive enough values to resolve all the required variables.  As
  such it returned a function ready to accept the remaining values.

  Once all values have been received the output will be generated.

  ## Performance

  I've done some
  [performance benchmarks](http://jsperf.com/formatter-performance) and
  formatter is faster than handlebars, but that isn't surprising as it is far
  simpler and doesn't have the smarts of HBS.  The test is really there to
  ensure that I didn't do anything too silly...

  Additionally, it should be noted that using formatter is 100% slower than
  concatenating strings, so don't use it where performance is critical. 
  Do use it where not repeating yourself is.
**/

var formatter = module.exports = function(format, opts) {
  // extract the matches from the string
  var parts = [];
  var output = [];
  var chunk;
  var varname;
  var varParts;
  var match = reVariable.exec(format);
  var isNumeric;
  var outputIdx = 0;
  var ignoreNumeric = (opts || {}).ignoreNumeric;

  while (match) {
    // get the prematch chunk
    chunk = format.slice(0, match.index);
    
    // if we have a valid chunk, add it to the parts
    if (chunk) {
      output[outputIdx++] = chunk;
    }
    
    varParts = match[1].split(/\s*\|\s*/);
    match[1] = varParts[0];
    
    // extract the varname
    varname = parseInt(match[1], 10);
    isNumeric = !isNaN(varname);

    // if this is a numeric replacement expression, and we are ignoring
    // those expressions then pass it through to the output
    if (ignoreNumeric && isNumeric) {
      output[outputIdx++] = match[0];
    }
    // otherwise, handle normally
    else {
      // extract the expression and add it as a function
      parts[parts.length] = {
        idx: (outputIdx++),
        numeric: isNumeric,
        varname: isNumeric ? varname : match[1],
        modifiers: varParts.length > 1 ? createModifiers(varParts.slice(1)) : []
      };
    }

    // remove this matched chunk and replacer from the string
    format = format.slice(match.index + match[0].length);

    // check for the next match
    match = reVariable.exec(format);
  }
  
  // if we still have some of the format string remaining, add it to the list
  if (format) {
    output[outputIdx++] = format;
  }

  return collect(parts, output);
};

formatter.error = function(message) {
  // create the format
  var format = formatter(message);
  
  return function(err) {
    var output;
    
    // if no error has been supplied, then pass it straight through
    if (! err) {
      return;
    }

    output = new Error(
      format.apply(null, Array.prototype.slice.call(arguments, 1)));

    output._original = err;

    // return the new error
    return output;
  };
};

function collect(parts, resolved, indexShift) {
  // default optionals
  indexShift = indexShift || 0;

  return function() {
    var output = [].concat(resolved);
    var unresolved;
    var ii;
    var part;
    var partIdx;
    var propNames;
    var val;
    var numericResolved = [];

    // find the unresolved parts
    unresolved = parts.filter(function(part) {
      return typeof output[part.idx] == 'undefined';
    });

    // initialise the counter
    ii = unresolved.length;

    // iterate through the unresolved parts and attempt to resolve the value
    for (; ii--; ) {
      part = unresolved[ii];

      if (typeof part == 'object') {
        // if this is a numeric part, this is a simple index lookup
        if (part.numeric) {
          partIdx = part.varname - indexShift;
          if (arguments.length > partIdx) {
            output[part.idx] = arguments[partIdx];
            if (numericResolved.indexOf(part.varname) < 0) {
              numericResolved[numericResolved.length] = part.varname;
            }
          }
        }
        // otherwise, we are doing a recursive property search
        else if (arguments.length > 0) {
          propNames = (part.varname || '').split('.');

          // initialise the output from the last valid argument
          output[part.idx] = (arguments[arguments.length - 1] || {});
          while (output[part.idx] && propNames.length > 0) {
            val = output[part.idx][propNames.shift()];
            output[part.idx] = typeof val != 'undefined' ? val : '';
          }
        }

        // if the output was resolved, then apply the modifier
        if (typeof output[part.idx] != 'undefined' && part.modifiers) {
          output[part.idx] = applyModifiers(part.modifiers, output[part.idx]);
        }
      }
    }

    // reasses unresolved (only caring about numeric parts)
    unresolved = parts.filter(function(part) {
      return part.numeric && typeof output[part.idx] == 'undefined';
    });

    // if we have no unresolved parts, then return the value
    if (unresolved.length === 0) {
      return output.join('');
    }

    // otherwise, return the collect function again
    return collect(
      parts,
      output,
      indexShift + numericResolved.length
    );
  };
}

function applyModifiers(modifiers, value) {
  // if we have modifiers, then tweak the output
  for (var ii = 0, count = modifiers.length; ii < count; ii++) {
    value = modifiers[ii](value);
  }

  return value;
}

function createModifiers(modifierStrings) {
  var modifiers = [];
  var parts;
  var fn;
  
  for (var ii = 0, count = modifierStrings.length; ii < count; ii++) {
    parts = modifierStrings[ii].split(':');
    fn = mods[parts[0].toLowerCase()];
    
    if (fn) {
      modifiers[modifiers.length] = fn.apply(null, parts.slice(1));
    }
  }
  
  return modifiers;
}

},{"./mods":3}],3:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## Modifiers

**/

/**
  ### Length Modifier (len)

  The length modifier is used to ensure that a string is exactly the length specified.  The string is sliced to the required max length, and then padded out with spaces (or a specified character) to meet the required length.

  ```js
  // pad the string test to 10 characters
  formatter('{{ 0|len:10 }}')('test');   // 'test      '

  // pad the string test to 10 characters, using a as the padding character
  formatter('{{ 0|len:10:a }}')('test'); // 'testaaaaaa'
  ```
**/
exports.len = function(length, padder) {
  var testInt = parseInt(padder, 10);
  var isNumber;

  // default the padder to a space
  padder = (! isNaN(testInt)) ? testInt : (padder || ' ');

  // check whether we have a number for padding (we will pad left if we do)
  isNumber = typeof padder == 'number';
  
  return function(input) {
    var output = input.toString().slice(0, length);
    
    // pad the string to the required length
    while (output.length < length) {
      output = isNumber ? padder + output : output + padder;
    }
    
    return output;
  };
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9kb2VobG1hbi8uYmFzaGluYXRlL2luc3RhbGwvbm9kZS8wLjEwLjI2L2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZG9laGxtYW4vY29kZS9ydGMuaW8vc2NyZWVuc2hhcmUvY2hyb21lLWV4dGVuc2lvbi9pbmRleC5qcyIsIi9ob21lL2RvZWhsbWFuL2NvZGUvcnRjLmlvL3NjcmVlbnNoYXJlL25vZGVfbW9kdWxlcy9mb3JtYXR0ZXIvaW5kZXguanMiLCIvaG9tZS9kb2VobG1hbi9jb2RlL3J0Yy5pby9zY3JlZW5zaGFyZS9ub2RlX21vZHVsZXMvZm9ybWF0dGVyL21vZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9ybWF0dGVyID0gcmVxdWlyZSgnZm9ybWF0dGVyJyk7XG52YXIgcG9zdE1lc3NhZ2UgPSBmb3JtYXR0ZXIoJ3dpbmRvdy5wb3N0TWVzc2FnZShcInt7IDAgfX1cIiwgXCJ7eyAxIH19XCIpOycpO1xuXG5mdW5jdGlvbiBjYXB0dXJlKHRhYikge1xuICBjb25zb2xlLmxvZygnY2xpY2tlZCwgd2UgaGF2ZSB0YWI6ICcsIHRhYik7XG4gIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQoe1xuICAgIGNvZGU6IHBvc3RNZXNzYWdlKCdoZWxsbycsIHRhYi51cmwpXG4gIH0pO1xufVxuXG5jaHJvbWUuYnJvd3NlckFjdGlvbi5vbkNsaWNrZWQuYWRkTGlzdGVuZXIoY2FwdHVyZSk7XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVWYXJpYWJsZSA9IC9cXHtcXHtcXHMqKFteXFx9XSs/KVxccypcXH1cXH0vO1xudmFyIG1vZHMgPSByZXF1aXJlKCcuL21vZHMnKTtcblxuLyoqXG4gICMgZm9ybWF0dGVyXG5cbiAgVGhpcyBpcyBhIHNpbXBsZSBsaWJyYXJ5IGRlc2lnbmVkIHRvIGRvIG9uZSB0aGluZyBhbmQgb25lIHRoaW5nIG9ubHkgLVxuICByZXBsYWNlIHZhcmlhYmxlcyBpbiBzdHJpbmdzIHdpdGggdmFyaWFibGUgdmFsdWVzLiAgSXQgaXMgYnVpbHQgaW4gc3VjaCBhXG4gIHdheSB0aGF0IHRoZSBmb3JtYXR0ZXIgc3RyaW5ncyBhcmUgcGFyc2VkIGFuZCB5b3UgYXJlIHByb3ZpZGVkIHdpdGggYVxuICBmdW5jdGlvbiB0aGFuIGNhbiBlZmZpY2llbnRseSBiZSBjYWxsZWQgdG8gcHJvdmlkZSB0aGUgY3VzdG9tIG91dHB1dC5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGVzL2xpa2Vmb29kLmpzXG5cbiAgX19OT1RFX186IEZvcm1hdHRlciBpcyBub3QgZGVzaWduZWQgdG8gYmUgYSB0ZW1wbGF0aW5nIGxpYnJhcnkgYW5kIGlmXG4gIHlvdSBhcmUgYWxyZWFkeSB1c2luZyBzb21ldGhpbmcgbGlrZSBIYW5kbGViYXJzIG9yXG4gIFtob2dhbl0oaHR0cHM6Ly9naXRodWIuY29tL3R3aXR0ZXIvaG9nYW4uanMpIGluIHlvdXIgbGlicmFyeSBvciBhcHBsaWNhdGlvblxuICBzdGFjayBjb25zaWRlciB1c2luZyB0aGVtIGluc3RlYWQuXG5cbiAgIyMgVXNpbmcgbmFtZWQgdmFyaWFibGVzXG5cbiAgSW4gdGhlIGV4YW1wbGVzIGFib3ZlIHdlIHNhdyBob3cgdGhlIGZvcm1hdHRlciBjYW4gYmUgdXNlZCB0byByZXBsYWNlXG4gIGZ1bmN0aW9uIGFyZ3VtZW50cyBpbiBhIGZvcm1hdHRlciBzdHJpbmcuICBXZSBjYW4gYWxzbyBzZXQgdXAgYSBmb3JtYXR0ZXJcbiAgdG8gdXNlIHBhcnRpY3VsYXIga2V5IHZhbHVlcyBmcm9tIGFuIGlucHV0IHN0cmluZyBpbnN0ZWFkIGlmIHRoYXQgaXMgbW9yZVxuICBzdWl0YWJsZTpcblxuICA8PDwgZXhhbXBsZXMvbGlrZWZvb2QtbmFtZWQuanNcblxuICAjIyBOZXN0ZWQgUHJvcGVydHkgVmFsdWVzXG5cbiAgU2luY2UgdmVyc2lvbiBgMC4xLjBgIHlvdSBjYW4gYWxzbyBhY2Nlc3MgbmVzdGVkIHByb3BlcnR5IHZhbHVlcywgYXMgeW91XG4gIGNhbiB3aXRoIHRlbXBsYXRlcyBsaWtlIGhhbmRsZWJhcnMuXG5cbiAgIyMgUGFydGlhbCBFeGVjdXRpb25cblxuICBTaW5jZSB2ZXJzaW9uIGAwLjMueGAgZm9ybWF0dGVyIGFsc28gc3VwcG9ydHMgcGFydGlhbCBleGVjdXRpb24gd2hlbiB1c2luZ1xuICBpbmRleGVkIGFyZ3VtZW50cyAoZS5nLiBge3sgMCB9fWAsIGB7eyAxIH19YCwgZXRjKS4gIEZvciBleGFtcGxlOlxuXG4gIDw8PCBleGFtcGxlcy9wYXJ0aWFsLmpzXG5cbiAgSW4gdGhlIGNhc2UgYWJvdmUsIHRoZSBvcmlnaW5hbCBmb3JtYXR0ZXIgZnVuY3Rpb24gcmV0dXJuZWQgYnkgYGZvcm1hdHRlcmBcbiAgZGlkIG5vdCByZWNlaXZlIGVub3VnaCB2YWx1ZXMgdG8gcmVzb2x2ZSBhbGwgdGhlIHJlcXVpcmVkIHZhcmlhYmxlcy4gIEFzXG4gIHN1Y2ggaXQgcmV0dXJuZWQgYSBmdW5jdGlvbiByZWFkeSB0byBhY2NlcHQgdGhlIHJlbWFpbmluZyB2YWx1ZXMuXG5cbiAgT25jZSBhbGwgdmFsdWVzIGhhdmUgYmVlbiByZWNlaXZlZCB0aGUgb3V0cHV0IHdpbGwgYmUgZ2VuZXJhdGVkLlxuXG4gICMjIFBlcmZvcm1hbmNlXG5cbiAgSSd2ZSBkb25lIHNvbWVcbiAgW3BlcmZvcm1hbmNlIGJlbmNobWFya3NdKGh0dHA6Ly9qc3BlcmYuY29tL2Zvcm1hdHRlci1wZXJmb3JtYW5jZSkgYW5kXG4gIGZvcm1hdHRlciBpcyBmYXN0ZXIgdGhhbiBoYW5kbGViYXJzLCBidXQgdGhhdCBpc24ndCBzdXJwcmlzaW5nIGFzIGl0IGlzIGZhclxuICBzaW1wbGVyIGFuZCBkb2Vzbid0IGhhdmUgdGhlIHNtYXJ0cyBvZiBIQlMuICBUaGUgdGVzdCBpcyByZWFsbHkgdGhlcmUgdG9cbiAgZW5zdXJlIHRoYXQgSSBkaWRuJ3QgZG8gYW55dGhpbmcgdG9vIHNpbGx5Li4uXG5cbiAgQWRkaXRpb25hbGx5LCBpdCBzaG91bGQgYmUgbm90ZWQgdGhhdCB1c2luZyBmb3JtYXR0ZXIgaXMgMTAwJSBzbG93ZXIgdGhhblxuICBjb25jYXRlbmF0aW5nIHN0cmluZ3MsIHNvIGRvbid0IHVzZSBpdCB3aGVyZSBwZXJmb3JtYW5jZSBpcyBjcml0aWNhbC4gXG4gIERvIHVzZSBpdCB3aGVyZSBub3QgcmVwZWF0aW5nIHlvdXJzZWxmIGlzLlxuKiovXG5cbnZhciBmb3JtYXR0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZvcm1hdCwgb3B0cykge1xuICAvLyBleHRyYWN0IHRoZSBtYXRjaGVzIGZyb20gdGhlIHN0cmluZ1xuICB2YXIgcGFydHMgPSBbXTtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICB2YXIgY2h1bms7XG4gIHZhciB2YXJuYW1lO1xuICB2YXIgdmFyUGFydHM7XG4gIHZhciBtYXRjaCA9IHJlVmFyaWFibGUuZXhlYyhmb3JtYXQpO1xuICB2YXIgaXNOdW1lcmljO1xuICB2YXIgb3V0cHV0SWR4ID0gMDtcbiAgdmFyIGlnbm9yZU51bWVyaWMgPSAob3B0cyB8fCB7fSkuaWdub3JlTnVtZXJpYztcblxuICB3aGlsZSAobWF0Y2gpIHtcbiAgICAvLyBnZXQgdGhlIHByZW1hdGNoIGNodW5rXG4gICAgY2h1bmsgPSBmb3JtYXQuc2xpY2UoMCwgbWF0Y2guaW5kZXgpO1xuICAgIFxuICAgIC8vIGlmIHdlIGhhdmUgYSB2YWxpZCBjaHVuaywgYWRkIGl0IHRvIHRoZSBwYXJ0c1xuICAgIGlmIChjaHVuaykge1xuICAgICAgb3V0cHV0W291dHB1dElkeCsrXSA9IGNodW5rO1xuICAgIH1cbiAgICBcbiAgICB2YXJQYXJ0cyA9IG1hdGNoWzFdLnNwbGl0KC9cXHMqXFx8XFxzKi8pO1xuICAgIG1hdGNoWzFdID0gdmFyUGFydHNbMF07XG4gICAgXG4gICAgLy8gZXh0cmFjdCB0aGUgdmFybmFtZVxuICAgIHZhcm5hbWUgPSBwYXJzZUludChtYXRjaFsxXSwgMTApO1xuICAgIGlzTnVtZXJpYyA9ICFpc05hTih2YXJuYW1lKTtcblxuICAgIC8vIGlmIHRoaXMgaXMgYSBudW1lcmljIHJlcGxhY2VtZW50IGV4cHJlc3Npb24sIGFuZCB3ZSBhcmUgaWdub3JpbmdcbiAgICAvLyB0aG9zZSBleHByZXNzaW9ucyB0aGVuIHBhc3MgaXQgdGhyb3VnaCB0byB0aGUgb3V0cHV0XG4gICAgaWYgKGlnbm9yZU51bWVyaWMgJiYgaXNOdW1lcmljKSB7XG4gICAgICBvdXRwdXRbb3V0cHV0SWR4KytdID0gbWF0Y2hbMF07XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSwgaGFuZGxlIG5vcm1hbGx5XG4gICAgZWxzZSB7XG4gICAgICAvLyBleHRyYWN0IHRoZSBleHByZXNzaW9uIGFuZCBhZGQgaXQgYXMgYSBmdW5jdGlvblxuICAgICAgcGFydHNbcGFydHMubGVuZ3RoXSA9IHtcbiAgICAgICAgaWR4OiAob3V0cHV0SWR4KyspLFxuICAgICAgICBudW1lcmljOiBpc051bWVyaWMsXG4gICAgICAgIHZhcm5hbWU6IGlzTnVtZXJpYyA/IHZhcm5hbWUgOiBtYXRjaFsxXSxcbiAgICAgICAgbW9kaWZpZXJzOiB2YXJQYXJ0cy5sZW5ndGggPiAxID8gY3JlYXRlTW9kaWZpZXJzKHZhclBhcnRzLnNsaWNlKDEpKSA6IFtdXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHJlbW92ZSB0aGlzIG1hdGNoZWQgY2h1bmsgYW5kIHJlcGxhY2VyIGZyb20gdGhlIHN0cmluZ1xuICAgIGZvcm1hdCA9IGZvcm1hdC5zbGljZShtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCk7XG5cbiAgICAvLyBjaGVjayBmb3IgdGhlIG5leHQgbWF0Y2hcbiAgICBtYXRjaCA9IHJlVmFyaWFibGUuZXhlYyhmb3JtYXQpO1xuICB9XG4gIFxuICAvLyBpZiB3ZSBzdGlsbCBoYXZlIHNvbWUgb2YgdGhlIGZvcm1hdCBzdHJpbmcgcmVtYWluaW5nLCBhZGQgaXQgdG8gdGhlIGxpc3RcbiAgaWYgKGZvcm1hdCkge1xuICAgIG91dHB1dFtvdXRwdXRJZHgrK10gPSBmb3JtYXQ7XG4gIH1cblxuICByZXR1cm4gY29sbGVjdChwYXJ0cywgb3V0cHV0KTtcbn07XG5cbmZvcm1hdHRlci5lcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgLy8gY3JlYXRlIHRoZSBmb3JtYXRcbiAgdmFyIGZvcm1hdCA9IGZvcm1hdHRlcihtZXNzYWdlKTtcbiAgXG4gIHJldHVybiBmdW5jdGlvbihlcnIpIHtcbiAgICB2YXIgb3V0cHV0O1xuICAgIFxuICAgIC8vIGlmIG5vIGVycm9yIGhhcyBiZWVuIHN1cHBsaWVkLCB0aGVuIHBhc3MgaXQgc3RyYWlnaHQgdGhyb3VnaFxuICAgIGlmICghIGVycikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG91dHB1dCA9IG5ldyBFcnJvcihcbiAgICAgIGZvcm1hdC5hcHBseShudWxsLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG5cbiAgICBvdXRwdXQuX29yaWdpbmFsID0gZXJyO1xuXG4gICAgLy8gcmV0dXJuIHRoZSBuZXcgZXJyb3JcbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xufTtcblxuZnVuY3Rpb24gY29sbGVjdChwYXJ0cywgcmVzb2x2ZWQsIGluZGV4U2hpZnQpIHtcbiAgLy8gZGVmYXVsdCBvcHRpb25hbHNcbiAgaW5kZXhTaGlmdCA9IGluZGV4U2hpZnQgfHwgMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLmNvbmNhdChyZXNvbHZlZCk7XG4gICAgdmFyIHVucmVzb2x2ZWQ7XG4gICAgdmFyIGlpO1xuICAgIHZhciBwYXJ0O1xuICAgIHZhciBwYXJ0SWR4O1xuICAgIHZhciBwcm9wTmFtZXM7XG4gICAgdmFyIHZhbDtcbiAgICB2YXIgbnVtZXJpY1Jlc29sdmVkID0gW107XG5cbiAgICAvLyBmaW5kIHRoZSB1bnJlc29sdmVkIHBhcnRzXG4gICAgdW5yZXNvbHZlZCA9IHBhcnRzLmZpbHRlcihmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG91dHB1dFtwYXJ0LmlkeF0gPT0gJ3VuZGVmaW5lZCc7XG4gICAgfSk7XG5cbiAgICAvLyBpbml0aWFsaXNlIHRoZSBjb3VudGVyXG4gICAgaWkgPSB1bnJlc29sdmVkLmxlbmd0aDtcblxuICAgIC8vIGl0ZXJhdGUgdGhyb3VnaCB0aGUgdW5yZXNvbHZlZCBwYXJ0cyBhbmQgYXR0ZW1wdCB0byByZXNvbHZlIHRoZSB2YWx1ZVxuICAgIGZvciAoOyBpaS0tOyApIHtcbiAgICAgIHBhcnQgPSB1bnJlc29sdmVkW2lpXTtcblxuICAgICAgaWYgKHR5cGVvZiBwYXJ0ID09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIGlmIHRoaXMgaXMgYSBudW1lcmljIHBhcnQsIHRoaXMgaXMgYSBzaW1wbGUgaW5kZXggbG9va3VwXG4gICAgICAgIGlmIChwYXJ0Lm51bWVyaWMpIHtcbiAgICAgICAgICBwYXJ0SWR4ID0gcGFydC52YXJuYW1lIC0gaW5kZXhTaGlmdDtcbiAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IHBhcnRJZHgpIHtcbiAgICAgICAgICAgIG91dHB1dFtwYXJ0LmlkeF0gPSBhcmd1bWVudHNbcGFydElkeF07XG4gICAgICAgICAgICBpZiAobnVtZXJpY1Jlc29sdmVkLmluZGV4T2YocGFydC52YXJuYW1lKSA8IDApIHtcbiAgICAgICAgICAgICAgbnVtZXJpY1Jlc29sdmVkW251bWVyaWNSZXNvbHZlZC5sZW5ndGhdID0gcGFydC52YXJuYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBvdGhlcndpc2UsIHdlIGFyZSBkb2luZyBhIHJlY3Vyc2l2ZSBwcm9wZXJ0eSBzZWFyY2hcbiAgICAgICAgZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBwcm9wTmFtZXMgPSAocGFydC52YXJuYW1lIHx8ICcnKS5zcGxpdCgnLicpO1xuXG4gICAgICAgICAgLy8gaW5pdGlhbGlzZSB0aGUgb3V0cHV0IGZyb20gdGhlIGxhc3QgdmFsaWQgYXJndW1lbnRcbiAgICAgICAgICBvdXRwdXRbcGFydC5pZHhdID0gKGFyZ3VtZW50c1thcmd1bWVudHMubGVuZ3RoIC0gMV0gfHwge30pO1xuICAgICAgICAgIHdoaWxlIChvdXRwdXRbcGFydC5pZHhdICYmIHByb3BOYW1lcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YWwgPSBvdXRwdXRbcGFydC5pZHhdW3Byb3BOYW1lcy5zaGlmdCgpXTtcbiAgICAgICAgICAgIG91dHB1dFtwYXJ0LmlkeF0gPSB0eXBlb2YgdmFsICE9ICd1bmRlZmluZWQnID8gdmFsIDogJyc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIG91dHB1dCB3YXMgcmVzb2x2ZWQsIHRoZW4gYXBwbHkgdGhlIG1vZGlmaWVyXG4gICAgICAgIGlmICh0eXBlb2Ygb3V0cHV0W3BhcnQuaWR4XSAhPSAndW5kZWZpbmVkJyAmJiBwYXJ0Lm1vZGlmaWVycykge1xuICAgICAgICAgIG91dHB1dFtwYXJ0LmlkeF0gPSBhcHBseU1vZGlmaWVycyhwYXJ0Lm1vZGlmaWVycywgb3V0cHV0W3BhcnQuaWR4XSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZWFzc2VzIHVucmVzb2x2ZWQgKG9ubHkgY2FyaW5nIGFib3V0IG51bWVyaWMgcGFydHMpXG4gICAgdW5yZXNvbHZlZCA9IHBhcnRzLmZpbHRlcihmdW5jdGlvbihwYXJ0KSB7XG4gICAgICByZXR1cm4gcGFydC5udW1lcmljICYmIHR5cGVvZiBvdXRwdXRbcGFydC5pZHhdID09ICd1bmRlZmluZWQnO1xuICAgIH0pO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSBubyB1bnJlc29sdmVkIHBhcnRzLCB0aGVuIHJldHVybiB0aGUgdmFsdWVcbiAgICBpZiAodW5yZXNvbHZlZC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBvdXRwdXQuam9pbignJyk7XG4gICAgfVxuXG4gICAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gdGhlIGNvbGxlY3QgZnVuY3Rpb24gYWdhaW5cbiAgICByZXR1cm4gY29sbGVjdChcbiAgICAgIHBhcnRzLFxuICAgICAgb3V0cHV0LFxuICAgICAgaW5kZXhTaGlmdCArIG51bWVyaWNSZXNvbHZlZC5sZW5ndGhcbiAgICApO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhcHBseU1vZGlmaWVycyhtb2RpZmllcnMsIHZhbHVlKSB7XG4gIC8vIGlmIHdlIGhhdmUgbW9kaWZpZXJzLCB0aGVuIHR3ZWFrIHRoZSBvdXRwdXRcbiAgZm9yICh2YXIgaWkgPSAwLCBjb3VudCA9IG1vZGlmaWVycy5sZW5ndGg7IGlpIDwgY291bnQ7IGlpKyspIHtcbiAgICB2YWx1ZSA9IG1vZGlmaWVyc1tpaV0odmFsdWUpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2RpZmllcnMobW9kaWZpZXJTdHJpbmdzKSB7XG4gIHZhciBtb2RpZmllcnMgPSBbXTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgZm47XG4gIFxuICBmb3IgKHZhciBpaSA9IDAsIGNvdW50ID0gbW9kaWZpZXJTdHJpbmdzLmxlbmd0aDsgaWkgPCBjb3VudDsgaWkrKykge1xuICAgIHBhcnRzID0gbW9kaWZpZXJTdHJpbmdzW2lpXS5zcGxpdCgnOicpO1xuICAgIGZuID0gbW9kc1twYXJ0c1swXS50b0xvd2VyQ2FzZSgpXTtcbiAgICBcbiAgICBpZiAoZm4pIHtcbiAgICAgIG1vZGlmaWVyc1ttb2RpZmllcnMubGVuZ3RoXSA9IGZuLmFwcGx5KG51bGwsIHBhcnRzLnNsaWNlKDEpKTtcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBtb2RpZmllcnM7XG59XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyMgTW9kaWZpZXJzXG5cbioqL1xuXG4vKipcbiAgIyMjIExlbmd0aCBNb2RpZmllciAobGVuKVxuXG4gIFRoZSBsZW5ndGggbW9kaWZpZXIgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhIHN0cmluZyBpcyBleGFjdGx5IHRoZSBsZW5ndGggc3BlY2lmaWVkLiAgVGhlIHN0cmluZyBpcyBzbGljZWQgdG8gdGhlIHJlcXVpcmVkIG1heCBsZW5ndGgsIGFuZCB0aGVuIHBhZGRlZCBvdXQgd2l0aCBzcGFjZXMgKG9yIGEgc3BlY2lmaWVkIGNoYXJhY3RlcikgdG8gbWVldCB0aGUgcmVxdWlyZWQgbGVuZ3RoLlxuXG4gIGBgYGpzXG4gIC8vIHBhZCB0aGUgc3RyaW5nIHRlc3QgdG8gMTAgY2hhcmFjdGVyc1xuICBmb3JtYXR0ZXIoJ3t7IDB8bGVuOjEwIH19JykoJ3Rlc3QnKTsgICAvLyAndGVzdCAgICAgICdcblxuICAvLyBwYWQgdGhlIHN0cmluZyB0ZXN0IHRvIDEwIGNoYXJhY3RlcnMsIHVzaW5nIGEgYXMgdGhlIHBhZGRpbmcgY2hhcmFjdGVyXG4gIGZvcm1hdHRlcigne3sgMHxsZW46MTA6YSB9fScpKCd0ZXN0Jyk7IC8vICd0ZXN0YWFhYWFhJ1xuICBgYGBcbioqL1xuZXhwb3J0cy5sZW4gPSBmdW5jdGlvbihsZW5ndGgsIHBhZGRlcikge1xuICB2YXIgdGVzdEludCA9IHBhcnNlSW50KHBhZGRlciwgMTApO1xuICB2YXIgaXNOdW1iZXI7XG5cbiAgLy8gZGVmYXVsdCB0aGUgcGFkZGVyIHRvIGEgc3BhY2VcbiAgcGFkZGVyID0gKCEgaXNOYU4odGVzdEludCkpID8gdGVzdEludCA6IChwYWRkZXIgfHwgJyAnKTtcblxuICAvLyBjaGVjayB3aGV0aGVyIHdlIGhhdmUgYSBudW1iZXIgZm9yIHBhZGRpbmcgKHdlIHdpbGwgcGFkIGxlZnQgaWYgd2UgZG8pXG4gIGlzTnVtYmVyID0gdHlwZW9mIHBhZGRlciA9PSAnbnVtYmVyJztcbiAgXG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xuICAgIHZhciBvdXRwdXQgPSBpbnB1dC50b1N0cmluZygpLnNsaWNlKDAsIGxlbmd0aCk7XG4gICAgXG4gICAgLy8gcGFkIHRoZSBzdHJpbmcgdG8gdGhlIHJlcXVpcmVkIGxlbmd0aFxuICAgIHdoaWxlIChvdXRwdXQubGVuZ3RoIDwgbGVuZ3RoKSB7XG4gICAgICBvdXRwdXQgPSBpc051bWJlciA/IHBhZGRlciArIG91dHB1dCA6IG91dHB1dCArIHBhZGRlcjtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcbn07Il19
