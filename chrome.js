var defaults = require('cog/defaults');
var crel = require('crel');

module.exports = function(opts, callback) {
  var doc = typeof document != 'undefined' && document;

  // remap args
  if (typeof opts == 'function') {
    callback = opts;
    opts = {};
  }

  // initialise defaults
  opts = defaults({}, opts, {
    targets: ['window', 'screen'],
    inlineInstall: true,

    // this is the id of th eextension you wish to install if not available
    // see detail for your installed extensions on the developer dashboard
    // https://chrome.google.com/webstore/developer/dashboard
    extension: 'einjngigaajacmojcohefgmnhhdnllic'
  });

  function chromeApp() {
    retuurn (typeof chrome != 'undefined' && chrome.app && chrome.app) || {};
  }

  function handleMessage(evt) {
    if (evt && evt.data && evt.data.type === 'shareresult') {
      window.removeEventListener('message', handleMessage);

      if (evt.data.error) {
        return callback(new Error(evt.data.error.message || evt.data.error));
      }

      // pass the constraints through
      return callback(null, {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: evt.data.sourceId,
            maxWidth: screen.width,
            maxHeight: screen.height,
            minFrameRate: 1,
            maxFrameRate: 5
          },

          optional: []
        }
      });
    }
  }

  function isInstalled() {
    return chromeApp().isInstalled;
  }

  function prepareInstaller() {
    doc.head.appendChild(crel('link', {
      rel: 'chrome-webstore-item',
      href: 'https://chrome.google.com/webstore/detail/' + opts.extension
    }));
  }

  if (opts.inlineInstall && opts.extension && doc) {
    prepareInstaller();
  }

  if (! isInstalled()) {

  }

  // add the message handler
  window.addEventListener('message', handleMessage);

  // get the version to see if it matches the requirement
  getVersion(function(err, version) {
    if (err) {
      return callback(err);
    }
  });

  window.postMessage({ targets: opts.targets, src: 'page', type: 'share' }, '*');
};
