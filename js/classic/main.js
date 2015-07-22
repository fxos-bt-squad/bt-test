(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};

  var classic = exports.classic;
  var ui = exports.classic.ui;

  var testMain = function(container) {
    var tabsManager = new ui.TabsManager();
    container.append(tabsManager.selector);

    var FakeBackend = function(id) {
      this._eventHandler = {
        _me: this,
        onClose: function() {
          tabsManager.removeTab(this._me._tab);
          this._me._tab.destroy();
        },
        onTurnOn: function() {
          this._me._switch.state = this._me._switch.STATE.ON;
        },
        onTurnOff: function() {
          this._me._switch.state = this._me._switch.STATE.OFF;
        },
        onCancelTurnOn: function() {},
        onCancelTurnOff: function() {},
        onPlay: function() {
          console.log('clicked');
        }
      };
      this._tab = new ui.Tab(this._eventHandler);
      this._tab.name = 'tab ' + id;
      this._switch = new ui.SwitchButtonBlock(
          this._eventHandler, 'name', 'description!!');
      this._play = new ui.PlayButtonBlock(
          this._eventHandler, 'name2', 'description2!!');

      this._tab.addBlock(this._switch, 0);
      this._tab.addBlock(this._play, 1);
      tabsManager.addTab(this._tab);
    };
    var backends = [];
    for (var i = 0; i < 4; ++i) {
      backends.push(new FakeBackend(i));
    }
  };

  classic.start = function(container) {
    testMain(container);
  };
})(window);
