(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};

  var classic = exports.classic;
  var ui = exports.classic.ui;

  var testMain = function(container) {
    var tabsManager = new ui.TabsManager();
    container.append(tabsManager.selector);

    var FakeBackend = function(id) {
      var handlers = {
        onClose: function() {
          tabsManager.removeTab(this._backend._tab);
          this._backend._tab.destroy();
        },
        onTurnOn: function() {
          this._backend._switch.state = this._backend._switch.STATE.ON;
        },
        onTurnOff: function() {
          this._backend._switch.state = this._backend._switch.STATE.OFF;
        },
        onPlay: function() {
          console.log('clicked');
        },
        onStart: function() {
          this._backend._execution.state =
              this._backend._execution.STATE.RUNNING;
          this._backend._execution.progressRatio = 0.5;
          this._backend._execution.status = 'running';
        },
        onStop: function() {
          this._backend._execution.state =
              this._backend._execution.STATE.PENDING;
          this._backend._execution.progressRatio = 0;
          this._backend._execution.status = 'none';
        },
        onChange: function(component, value) {
          console.log(value);
        },
        _backend: this
      };
      this._tab = new ui.Tab(handlers, 'tab ' + id);
      this._switch = new ui.SwitchButtonBlock(handlers, 'name', 'description',
                                              ui.SwitchButtonBlock.STATE.OFF,
                                              true);
      this._play = new ui.PlayButtonBlock(handlers, 'name2', 'description',
                                          true);
      var numberInput = new ui.NumberInput(handlers, 5, 50, 5, 30);
      var stringInput = new ui.StringInput(handlers, 'abc');
      var optionsInput = new ui.OptionsInput(handlers, ['a', 'b', 'c'], 'b');
      var tmpInput = new ui.OptionsInput(handlers, ['a', 'b', 'c'], 'b');
      this._execution = new ui.ExecutionBlock(handlers, 'name3', 'description');
      this._execution.addParameter('par1', numberInput, -1);
      this._execution.addParameter('par2', stringInput, -1);
      this._execution.addParameter('par3', optionsInput, -1);
      this._execution.addParameter('par4', tmpInput, -2);
      this._execution.removeParameter('par4');

      this._tab.addBlock(this._switch, -1);
      this._tab.addBlock(this._play, -1);
      this._tab.addBlock(this._execution, -1);
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
