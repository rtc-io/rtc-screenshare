var media = require('rtc-media');
var h = require('hyperscript');
var screenshare = require('..')({
  chromeExtension: 'rtc.io screenshare',
  version: '^1.0.0'
});

var buttons = {
  install: h('button', 'Install Extension', { onclick: function() {
    chrome.webstore.install();
  }}),

  capture: h('button', 'Capture Screen', { onclick: shareScreen })
};

function shareScreen() {
  screenshare.request(function(err, constraints) {
    if (err) {
      return console.error('Could not capture window: ', err);
    }

    console.log('attempting capture with constraints: ', constraints);
    media({
      constraints: constraints,
      target: document.getElementById('main')
    });
  });

  // you better select something quick or this will be cancelled!!!
  setTimeout(screenshare.cancel, 5e3);
}

// detect whether the screenshare plugin is available and matches
// the required version
screenshare.available(function(err, version) {
  var actions = document.getElementById('actions');

  if (err) {
    if (version === 'not-supported') {
      return actions.appendChild(
        h('div', 'Sorry, but screen capture is not supported in this browser and version [%s]', extension.type)
      );
    }
    return actions.appendChild(buttons.install);
  }

  actions.appendChild(buttons.capture);
});

// on install show the capture button and remove the install button if active
screenshare.on('activate', function() {
  if (buttons.install.parentNode) {
    buttons.install.parentNode.removeChild(buttons.install);
  }

  document.getElementById('actions').appendChild(buttons.capture);
});
