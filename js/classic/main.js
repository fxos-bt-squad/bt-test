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
        },
        onStart: function() {
          this._me._execution.state = this._me._execution.STATE.RUNNING;
        },
        onStop: function() {
          this._me._execution.state = this._me._execution.STATE.PENDING;
        }
      };
      this._tab = new ui.Tab(this._eventHandler);
      this._tab.name = 'tab ' + id;
      this._switch = new ui.SwitchButtonBlock(
          this._eventHandler, 'name', 'description!!');
      this._play = new ui.PlayButtonBlock(
          this._eventHandler, 'name2', 'description2!!');
      var numberInput = new ui.NumberInput({onChange: function() {}},
                                           5, 50, 5, 30);
      var stringInput = new ui.StringInput({onChange: function() {}}, 'abc');
      var optionsInput = new ui.OptionsInput({onChange: function() {}},
                                             ['a', 'b', 'c'], 'b');
      var tmpInput = new ui.OptionsInput({onChange: function() {}},
                                         ['a', 'b', 'c'], 'b');
      this._execution = new ui.ExecutionBlock(this._eventHandler,
                                              'execution block',
                                              'test description');
      this._execution.addParameter('par1', numberInput, 0);
      this._execution.addParameter('par2', stringInput, 0);
      this._execution.addParameter('par3', optionsInput, 0);
      this._execution.addParameter('par4', tmpInput, 0);
      this._execution.removeParameter('par4');

      this._tab.addBlock(this._switch, 0);
      this._tab.addBlock(this._play, 1);
      this._tab.addBlock(this._execution, 2);
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
