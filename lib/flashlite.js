var defaultcss = require('defaultcss');

module.exports = function(opts) {
  var padding = (opts || {}).padding || 10;
  var height = (opts || {}).height || 50;
  var realHeight = height - padding*2;
  var div = document.createElement('div');
  var containerBounds = document.body.getBoundingClientRect();

  // calculate the left and top offset
  var leftOffset = -containerBounds.left;
  var topOffset = -(height + containerBounds.top);

  defaultcss('flashlite', [
    '.flashlite {',
    '  background: silver;',
    '  height: ' + realHeight + 'px;',
    '  padding: ' + padding + 'px 0;',
    '  width: 100%;',
    '  position: absolute;',
    '  -webkit-transition: all ease-in-out 0.2s;',
    '  -moz-transition: all ease-in-out 0.2s;',
    '  transition: all ease-in-out 0.2s;',
    '}',
    '',
    '.flashlite.active {',
    '  -webkit-transform: translate3D(0, ' + height + 'px, 0);',
    '  transform: translate3D(0, ' + height + 'px, 0);',
    '}'
  ].join('\n'));

  div.className = 'flashlite';

  if (document.body.childNodes.length > 0) {
    document.body.insertBefore(div, document.body.childNodes[0]);
  }
  else {
    document.body.appendChild(div);
  }

  function flash(message) {
    var bounds = div.getBoundingClientRect();

    // set the inner text
    div.innerText = message;

    // recalculate container bounds
    containerBounds = document.body.getBoundingClientRect();

    div.classList.add('active');
  };

  flash.hide = function() {
    div.classList.remove('active');
  };

  // set the margin for the element
  div.style.margin = topOffset + 'px 0 0 ' + leftOffset + 'px';

  return flash;
};