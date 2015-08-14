(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.backend = exports.classic.backend || {};

  var ui = exports.classic.ui;
  var backend = exports.classic.backend;

  backend.BluetoothManagerTab = function(tabsManager) {
    this._tabsManager = tabsManager;
    this._tab = new ui.Tab({}, 'BluetoothManager');
    this._adapterBlocks = [];

    this._tabsManager.addTab(this._tab);

    var events = ['adapteradded', 'adapterremoved', 'attributechanged'];
    var that = this;
    events.forEach(function(eventName) {
      navigator.mozBluetooth.addEventListener(eventName,
                                              that._updateBlocks.bind(that));
    });
  };

  backend.BluetoothManagerTab.prototype = {
    _updateBlocks: function() {
      this._adapterBlocks.forEach(function(adapterBlock) {
        adapterBlock.destroy();
      });
      this._adapterBlocks = [];
      var that = this;
      navigator.mozBluetooth.getAdapters().forEach(function(adapter) {
        that._adapterBlocks.push(new backend.BluetoothManagerTab.AdapterBlock(
            that._tabsManager, that._tab, adapter));
      });
    }
  };

  backend.BluetoothManagerTab.AdapterBlock = function(
      tabsManager, tab, adapter) {
    this._tabsManager = tabsManager;
    this._tab = tab;
    this._adapter = adapter;
    this._block = new ui.PlayButtonBlock(
        {onPlay: this._onPlayHandler.bind(this)}, '', '', true);
    this._attributeChangedHandler = this._generateAttributeChangedHandler();

    this._tab.addBlock(this._block, this._tab.numBlocks);
    this._adapter.addEventListener('attributechanged',
                                   this._attributeChangedHandler);

    // Trigger the event handler to initialize the title and description.
    this._attributeChangedHandler({attrs: ['address']});
  };

  backend.BluetoothManagerTab.AdapterBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
      this._adapter.removeEventListener('attributechanged',
                                        this._attributeChangedHandler);
    },

    _onPlayHandler: function() {
      var adapterTab = new backend.BluetoothAdapterTab(this._tabsManager,
                                                       this._adapter);
    },

    _generateAttributeChangedHandler: function() {
      var that = this;
      return function(evt) {
        evt.attrs.forEach(function(attr) {
          if (attr == 'address') {
            that._block.name = that._adapter.address;
          }
        });
        var desc = '';
        desc += 'name: ' + that._adapter.name + '<br>';
        desc += 'state: ' + that._adapter.state + '<br>';
        desc += 'discoverable: ' + that._adapter.discoverable + '<br>';
        that._block.description = desc;
      };
    }
  };

  backend.BluetoothAdapterTab = function(tabsManager, adapter) {
    this._tabsManager = tabsManager;
    this._tab = new ui.Tab({onClose: this._onClose.bind(this)}, '');
    this._adapter = adapter;
    this._enableBlock =
        new backend.BluetoothAdapterTab.EnableBlock(this._tab, this._adapter);
    this._discoverableBlock =
        new backend.BluetoothAdapterTab.DiscoverableBlock(this._tab,
                                                          this._adapter);
    this._discoveringBlock =
        new backend.BluetoothAdapterTab.DiscoveringBlock(this,
                                                         this._tab,
                                                         this._adapter);
    this._pairedDevicesListBlock =
        new backend.BluetoothAdapterTab.PairedDevicesListBlock(this._tab,
                                                               this._adapter);
    this._deviceBlocks = [];
    this._attributeChangedHandler = this._generateAttributeChangedHandler();

    this._tabsManager.addTab(this._tab);
    this._adapter.addEventListener('attributechanged',
                                   this._attributeChangedHandler);

    // Trigger the event handler to initialize the title of this tab.
    this._attributeChangedHandler({attrs: ['address']});
  };

  backend.BluetoothAdapterTab.prototype = {
    addDeviceBlock: function(device) {
      this._deviceBlocks.push(new backend.BluetoothAdapterTab.DeviceBlock(
          this._tabsManager, this._tab, device));
    },

    removeAllDeviceBlocks: function() {
      this._deviceBlocks.forEach(function(deviceBlock) {
        deviceBlock.destroy();
      });
    },

    _generateAttributeChangedHandler: function() {
      var that = this;
      return function(evt) {
        evt.attrs.forEach(function(attr) {
          if (attr == 'address') {
            that._tab.name = that._adapter.address;
          }
        });
      };
    },

    _onClose: function() {
      this._enableBlock.destroy();
      this._discoverableBlock.destroy();
      this._discoveringBlock.destroy();
      this._pairedDevicesListBlock.destroy();

      this._tabsManager.removeTab(this._tab);
      this._tab.destroy();
    }
  };

  backend.BluetoothAdapterTab.EnableBlock = function(tab, adapter) {
    this._tab = tab;
    this._adapter = adapter;
    this._block = new ui.SwitchButtonBlock(
        this._generateUIEventHandlers(), 'Enabling', '',
        ui.SwitchButtonBlock.STATE.OFF, true);
    this._attributeChangedHandler = this._generateAttributeChangedHandler();

    this._tab.addBlock(this._block, this._tab.numBlocks);
    this._adapter.addEventListener('attributechanged',
                                   this._attributeChangedHandler);

    // Trigger the event handler to initialize the caption of this block.
    this._attributeChangedHandler({attrs: ['state']});
  };

  backend.BluetoothAdapterTab.EnableBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
      this._adapter.removeEventListener('attributechanged',
                                        this._attributeChangedHandler);
    },

    _generateAttributeChangedHandler: function() {
      var that = this;
      var adapterStateToUIState = {
        disabled: 'OFF',
        enabled: 'ON',
        enabling: 'TURNING_ON',
        disabling: 'TURNING_OFF'
      };

      return function(evt) {
        evt.attrs.forEach(function(attr) {
          if (attr == 'state') {
            var uiState = adapterStateToUIState[that._adapter.state];
            that._block.state = that._block.STATE[uiState];
          }
        });
      };
    },

    _generateUIEventHandlers: function() {
      var that = this;
      return {
        onTurnOn: function() {
          that._adapter.enable();
        },
        onTurnOff: function() {
          that._adapter.disable();
        },
        onCancelTurningOn: function() {
          that._adapter.disable();
        },
        onCancelTurningOff: function() {
          that._adapter.enable();
        }
      };
    }
  };

  backend.BluetoothAdapterTab.DiscoverableBlock = function(tab, adapter) {
    this._tab = tab;
    this._adapter = adapter;
    this._block = new ui.SwitchButtonBlock(
        this._generateUIEventHandlers(), 'Discoverable', '',
        ui.SwitchButtonBlock.STATE.OFF, true);
    this._attributeChangedHandler = this._generateAttributeChangedHandler();

    this._tab.addBlock(this._block, this._tab.numBlocks);
    this._adapter.addEventListener('attributechanged',
                                   this._attributeChangedHandler);

    // Trigger the event handler to initialize the caption of this block.
    this._attributeChangedHandler({attrs: ['discoverable']});
  };

  backend.BluetoothAdapterTab.DiscoverableBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
      this._adapter.removeEventListener('attributechanged',
                                        this._attributeChangedHandler);
    },

    _generateAttributeChangedHandler: function() {
      var that = this;

      return function(evt) {
        evt.attrs.forEach(function(attr) {
          if (attr == 'discoverable') {
            if (that._adapter.discoverable === true) {
              that._block.state = that._block.STATE.ON;
            } else {
              that._block.state = that._block.STATE.OFF;
            }
          }
        });
      };
    },

    _generateUIEventHandlers: function() {
      var that = this;
      return {
        onTurnOn: function() {
          that._adapter.setDiscoverable(true);
        },
        onTurnOff: function() {
          that._adapter.setDiscoverable(false);
        }
      };
    }
  };

  backend.BluetoothAdapterTab.DiscoveringBlock = function(
      adapterTab, tab, adapter) {
    this._adapterTab = adapterTab;
    this._tab = tab;
    this._adapter = adapter;
    this._handler = null;
    var state = ui.SwitchButtonBlock.STATE[
        this._adapter.discovering ? 'ON' : 'OFF'];
    this._block = new ui.SwitchButtonBlock(
        this._generateUIEventHandlers(), 'Discovering', '', state, true);

    this._tab.addBlock(this._block, this._tab.numBlocks);
  };

  backend.BluetoothAdapterTab.DiscoveringBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
    },

    _generateUIEventHandlers: function() {
      var that = this;
      return {
        onTurnOn: function() {
          that._adapterTab.removeAllDeviceBlocks();
          that._adapter.startDiscovery().then(function(handler) {
            that._handler = handler;
            that._handler.ondevicefound = function(evt) {
              that._adapterTab.addDeviceBlock(evt.device);
            };
            that._block.description = '';
            that._block.state = that._block.STATE.ON;
          }, function(reason) {
            that._block.description = 'fail: ' + reason;
            that._block.state = that._block.STATE.OFF;
          });
          that._block.state = that._block.STATE.TURNING_ON;
        },
        onTurnOff: function() {
          that._adapter.stopDiscovery().then(function() {
            that._block.description = '';
            that._block.state = that._block.STATE.OFF;
          }, function(reason) {
            that._block.description = 'fail: ' + reason;
            that._block.state = that._block.STATE.ON;
          });
          that._block.state = that._block.STATE.TURNING_OFF;
        }
      };
    }
  };

  backend.BluetoothAdapterTab.DeviceBlock = function(tabsManager, tab,
                                                     device) {
    this._tabsManager = tabsManager;
    this._tab = tab;
    this._device = device;
    this._block = new ui.PlayButtonBlock(
        {onPlay: this._onPlayHandler.bind(this)}, '', '', true);
    this._attributeChangedHandler = this._generateAttributeChangedHandler();

    this._tab.addBlock(this._block, this._tab.numBlocks);
    this._device.addEventListener('attributechanged',
                                  this._attributeChangedHandler);

    // Trigger the event handler to initialize the title and the description.
    this._attributeChangedHandler({attrs: ['address']});
  };

  backend.BluetoothAdapterTab.DeviceBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
      this._device.removeEventListener('attributechanged',
                                       this._attributeChangedHandler);
    },

    _onPlayHandler: function() {
      var tab = new backend.BluetoothDeviceTab(this._tabsManager, this._device);
    },

    _generateAttributeChangedHandler: function() {
      var that = this;
      return function(evt) {
        evt.attrs.forEach(function(eventName) {
          if (eventName == 'address') {
            that._block.name = that._device.address;
          }
        });
        var desc = '';
        desc += 'name: ' + that._device.name + '<br>';
        desc += that._device.paired ? 'paired<br>' : 'not paired <br>';
        that._block.description = desc;
      };
    }
  };

  backend.BluetoothAdapterTab.PairedDevicesListBlock = function(tab, adapter) {
    this._block = new ui.PlayButtonBlock(
        {onPlay: this._onPlayHandler.bind(this)},
        'Refresh the paired devices list', '', true);
    this._tab = tab;
    this._adapter = adapter;

    this._tab.addBlock(this._block, this._tab.numBlocks);

    // Initialize the description of this block.
    this._onPlayHandler();
  };

  backend.BluetoothAdapterTab.PairedDevicesListBlock.prototype = {
    destroy: function() {
      this._tab.removeBlock(this._block);
      this._block.destroy();
    },

    _onPlayHandler: function() {
      var desc = '';
      this._adapter.getPairedDevices().forEach(function(device) {
        desc += device.address;
        if (device.paired) {
          desc += '(paired)';
        }
        desc += '<br>';
      });
      this._block.description = desc;
    }
  };

  backend.BluetoothDeviceTab = function(tabsManager, device) {
    this._tabsManager = tabsManager;
    this._device = device;
    this._tab = new ui.Tab(
        {onClose: this._onCloseHandler.bind(this)}, device.address);

    this._tabsManager.addTab(this._tab);
  };

  backend.BluetoothDeviceTab.prototype = {
    _onCloseHandler: function() {
      this._tabsManager.removeTab(this._tab);
      this._tab.destroy();
    }
  };
})(window);
