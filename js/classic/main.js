(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};

  var classic = exports.classic;
  var ui = exports.classic.ui;
  var backend = exports.classic.backend;

  var main = function(container) {
    var tabsManager = new ui.TabsManager();
    container.append(tabsManager.selector);

    var entrance = new backend.BluetoothManagerTab(tabsManager);
  };

  classic.start = function(container) {
    main(container);
  };
})(window);
