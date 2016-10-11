var crel = require('crel');
var EventEmitter = require('eventemitter3');
var extend = require('cog/extend');

/**
  Returns true if we should use Chrome screensharing
 **/
exports.supported = function() {
  return window && window.process && window.process.type && window.require;
}

/**
  Creates the share context.
 **/
exports.share = function(opts) {
  opts = opts || {};

  var extension = new EventEmitter();
  extension.type = 'github/electron';

  var electron = null;
  try {
    electron = window.require('electron');
  } catch (err) {}

  extension.available = function(callback) {
    return callback((electron ? null : 'Electron was unable to be found'));
  };

  // patch in our capture function
  extension.request = function(callback) {

    function selectMedia(source, sourceId, metadata) {
      if (!source) return callback('No media selected');
      return callback(null, extend({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: source,
            chromeMediaSourceId: sourceId,
            maxWidth: screen.width,
            maxHeight: screen.height,
            minFrameRate: 1,
            maxFrameRate: 5
          },
          optional: []
        }
      }, opts.constraints), metadata);
    }

    // If we are a version of Electron (>= 0.36.0) that supports desktopCapture
    if (electron && electron.desktopCapturer && !opts.screenOnly) {
      electron.desktopCapturer.getSources(
        extend({types: ['window', 'screen']}, opts.capturer || {}),
        function(err, sources) {
          if (err) return callback(err);
          // If we only have one, select only that
          if (sources && sources.length === 1) {
            return selectMedia('desktop', sources[i].id, {title: 'Screen'} );
          }
          // Allow a customised visual selector
          (opts.selectorFn || simpleSelector)(sources, function(err, sourceId, metadata) {
            if (err) return callback(err);
            return selectMedia('desktop', sourceId, metadata);
          });
        }
      );
    }
    // Otherwise we only share the screen
    else {
      return selectMedia('screen', null, { title: 'Screen' });
    }
  };

  extension.cancel = function() {
  };

  return extension;
};

/**
  This is just a simple default screen selector implementation
 **/
function simpleSelector(sources, callback) {

  var options = crel('select', {
    style: 'margin: 0.5rem'
  }, sources.map(function(source) {
    return crel('option', {id: source.id, value: source.id}, source.name);
  }));

  var selector = crel('div',
    {
      style: 'position: absolute; padding: 1rem; z-index: 999999; background: #ffffff; width: 100%; font-family: \'Lucida Sans Unicode\', \'Lucida Grande\', sans-serif; box-shadow: 0px 2px 4px #dddddd;'
    },
    crel('label', { style: 'margin: 0.5rem' }, 'Share screen:'),
    options,
    crel('span', { style: 'margin: 0.5rem; display: inline-block' },
      button('Share', function() {
        close();
        var selected = sources.filter(function(source) {
          return source && source.id === options.value;
        })[0];
        return callback(null, options.value, { title: selected.name });
      }),
      button('Cancel', close)
    )
  );

  function button(text, fn) {
    var button = crel('button', {
      style: 'background: #555555; color: #ffffff; padding: 0.5rem 1rem; margin: 0rem 0.2rem;'
    }, text);
    button.addEventListener('click', fn);
    return button;
  }

  function close() {
    document.body.removeChild(selector);
  }

  document.body.appendChild(selector);
}