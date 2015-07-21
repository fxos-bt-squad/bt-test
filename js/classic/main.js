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
        }
      };
      this._tab = new ui.Tab(this._eventHandler);
      this._tab.name = 'tab ' + id;
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
