(function(exports) {
  'use strict';

  var App = function() {
  };

  App.prototype = {
    classicSection: document.getElementById('classic-api'),
    bleServerSection: document.getElementById('ble-server-api'),
    bleClientSection: document.getElementById('ble-client-api'),
    controlPanel: document.getElementById('control-panel'),

    panelSections: document.getElementsByClassName('panel'),
    modeButtons: document.getElementsByClassName('mode-button'),
    mode: document.body.dataset.mode,

    start: function() {
      var that = this;
      [].forEach.call(this.modeButtons, function(button) {
        button.addEventListener('click', that);
      });
    },

    handleEvent: function(evt) {
      var target = evt.target;
      if (evt.type === 'click' && target.classList.contains('mode-button')) {
        var mode = target.id.replace('-button', '');
        this.switchMode(mode);
      }
    },

    switchMode: function(mode) {
      document.body.dataset.mode = mode;
      [].forEach.call(this.panelSections, function(section) {
        if (section.id === mode) {
          section.hidden = false;
        } else {
          section.hidden = true;
        }
      });
      [].forEach.call(this.modeButtons, function(button) {
        if (button.id === mode + '-button') {
          button.disabled = 'disabled';
        } else {
          button.disabled = undefined;
        }
      });
    }
  };

  exports.app = new App();
  exports.app.start();
}(window));
