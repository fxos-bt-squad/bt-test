/* global $, evt, App, BleServer */
(function(exports) {
  'use strict';

  /**
   * Main class of bt-test
   * We have three modes in bt-test app:
   * 1. `classic-api`
   * 2. `ble-server-api`
   * 3. `ble-client-api`
   *
   * `App` controls how to switch from one mode to another mode and what
   * things to do in mode switching process. When user clicks button with
   * `class='mode-button'`, `App` will do things below:
   * 1. fire `before-switching-mode`.
   * 2. change panel and button UI.
   * 3. fire `after-switching-mode`.
   * @class App
   * @requires  {@link BleServer}
   * @requires  evt
   * @fires App#before-switching-mode
   * @fires App#after-switching-mode
   */
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

    /**
     *
     * Start the App instance
     * Here's the thing we do in `start()`:
     * 1. store the reference of major DOM element.
     * 2. set default mode.
     * 3. start `BleServer` instance.
     * 4. attach event listeners on all mode buttons.
     * 5. start `classic` instance which is responsible for classic api testing.
     * @method App#start
     * @public
     */
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

    /**
     * Event handler
     * @method App#handleEvent
     * @param  {Event} evt - event instance
     */
    handleEvent: function(evt) {
      var target = evt.target;
      if (evt.type === 'click' && target.classList.contains('mode-button')) {
        var mode = target.id.replace('-button', '');
        /**
         * @event App#before-switching-mode
         * @type {Object}
         * @property {String} mode - the mode before switching
         */
        this.fire('before-switching-mode', {mode: mode});
        this.switchMode(mode);
        /**
         * @event App#after-switching-mode
         * @type {Object}
         * @property {String} mode - the mode after switching
         */
        this.fire('after-switching-mode', {mode: mode});
      }
    },

    /**
     * The tasks we need to do at mode switching. This method do three things:
     * 1. write down mode in `<body>`, i.e. <body data-mode="classic-api">.
     * 2. display panel of the mode and hide the rest of panels.
     * 3. disabled button of the mode which we are going to switch to and enable
     *    the rest of buttons.
     * @method App#switchMode
     * @public
     * @param  {String} mode - the mode we are going to swtich to
     */
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
