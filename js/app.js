/* global $, evt, App, BleServer */

(function(exports) {
  'use strict';

  exports.App = function() {
  };

  App.prototype = evt({
    classicSection: undefined,
    bleServerSection: undefined,
    bleClientSection: undefined,
    controlPanel: undefined,
    panelSections: undefined,
    modeButtons: undefined,
    mode: undefined,
    _bleServer: undefined,

    start: function() {
      var that = this;
      this.classicSection = document.getElementById('classic-api'),
      this.bleServerSection = document.getElementById('ble-server-api'),
      this.bleClientSection = document.getElementById('ble-client-api'),
      this.controlPanel = document.getElementById('control-panel'),

      this.panelSections = document.getElementsByClassName('panel'),
      this.modeButtons =
        this.controlPanel.getElementsByClassName('mode-button'),
      this.mode = document.body.dataset.mode,

      this._bleServer = new BleServer();
      this._bleServer.start(this);

      [].forEach.call(this.modeButtons, function(button) {
        button.addEventListener('click', that);
      });

      exports.classic.start($('#classic-api'));
    },

    handleEvent: function(evt) {
      var target = evt.target;
      if (evt.type === 'click' && target.classList.contains('mode-button')) {
        var mode = target.id.replace('-button', '');
        this.fire('before-switching-mode', {mode: mode});
        this.switchMode(mode);
        this.fire('after-switching-mode', {mode: mode});
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
  });

}(window));
