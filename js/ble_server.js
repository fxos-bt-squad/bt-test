/* global BluetoothManager, evt */
'use strict';

(function(exports) {
  var BleServer = function() {};

  BleServer.prototype = evt({
    adapterStateElem: document.getElementById('ble-server-adapter-state'),
    discoveringStateElem:
      document.getElementById('ble-server-discovering-state'),
    devicesListElem: document.getElementById('ble-server-devices-list'),

    leScanButton: document.getElementById('le-scan'),

    _devices: {},

    _bluetoothManager: undefined,

    _app: undefined,

    _ready: false,

    _scanning: false,

    get scanning () {
      return this._scanning;
    },

    set scanning (value) {
      if (value !== this._scanning) {
        this._scanning = value;
        this._toggleLeScanButtonText();
        this.fire('scanning-changed', value);
      }
    },

    start: function(app) {
      var that = this;

      this._app = app;
      this._app.on('after-switching-mode', this.onModeSwitching.bind(this));

      this.handleDeviceFound = this.onBluetoothDeviceFound.bind(this);

      this._bluetoothManager = new BluetoothManager();
      this._bluetoothManager.init();
      this._bluetoothManager.on('state-changed', function(state) {
        that.adapterStateElem.textContent = state;
      });
      this._bluetoothManager.on('discovering-state-changed',
        function(discovering) {
          that.discoveringStateElem.textContent =
            discovering ? 'discovering' : 'not discovering';
        });

      this.leScanButton.addEventListener('click', this);
    },

    turnOn: function() {
      var that = this;
      if (!this._ready) {
        this._truncateDevices().then(function() {
          that._bluetoothManager.on('device-found', that.handleDeviceFound);
          that._bluetoothManager.safelyStartLeScan([]).then(function() {
            that.scanning = true;
          });
          that._ready = true;
        });
      }
    },

    turnOff: function() {
      if (this._ready) {
        this._truncateDevices();
        this._bluetoothManager.off('device-found', this.handleDeviceFound);
        this._bluetoothManager.safelyDisable();
        this.scanning = false;
        this._ready = false;
      }
    },

    _truncateDevices: function() {
      var that = this;
      // XXX
      return new Promise(function(resolve, reject) {
        that._devices = {};
        [].forEach.call(that.devicesListElem.children, function(childElem) {
          that.devicesListElem.removeChild(childElem);
        });
        resolve();
      });
    },

    _toggleLeScanButtonText: function() {
      this.leScanButton.textContent =
        this.scanning ? 'Stop LE Scan' : 'Start LE Scan';
    },

    _modifyDeviceElem: function(address, isConnected) {
      var that = this;
      var targetId = 'device-' + address;
      var button;
      var deviceElem;
      [].some.call(that.devicesListElem.children, function(childElem) {
        if (childElem.id === targetId) {
          deviceElem = childElem;
          button = childElem.getElementsByTagName('button')[0];
          return true;
        }
        return false;
      });

      if (button) {
        button.textContent = isConnected ? 'Disconnect' : 'Connect';
      }
      if (deviceElem) {
        deviceElem.dataset.isConnected = isConnected;
      }
    },

    onModeSwitching: function(detail) {
      if (detail) {
        switch(detail.mode) {
          case 'ble-server-api':
            this.turnOn();
            break;
          default:
            this.turnOff();
            break;
        }
      }
    },

    handleDeviceFound: undefined,
    onBluetoothDeviceFound: function(device) {
      var address = device.address;
      console.log('['+device.address + '] ' + device.name + ' (' +
        device.type + ')');
      if (!this._devices[address]) {
        this._devices[address] = device;
        this.devicesListElem.appendChild(this.createDeviceElem(device));
      }
    },

    connectDevice: function(device) {
      var that = this;
      var address = device.address;
      console.log('connect to ' + address);
      this._bluetoothManager.gattServerConnect(address).then(function() {
        console.log('resolve connect to ' + address);
        that._modifyDeviceElem(address, true);
      }).catch(function(reason) {
        console.warn('reject due to ' + reason);
      });
    },

    disconnectDevice: function(device) {
      var that = this;
      var address = device.address;
      console.log('disconnect from ' + address);
      this._bluetoothManager.gattServerDisconnect(address).then(function() {
        console.log('resolve disconnect from ' + address);
        that._modifyDeviceElem(address, false);
      }).catch(function(reason) {
        console.warn('reject due to ' + reason);
      });
    },

    handleEvent: function(evt) {
      var that = this;
      var target = evt.target;
      switch(evt.type) {
        case 'click':
          if (target.classList.contains('connect')) {
            var device = this._devices[target.dataset.address];
            var parentNode = target.parentNode;
            if (device) {
              if (parentNode.dataset.isConnected === 'true') {
                this.disconnectDevice(device);
              } else {
                this.connectDevice(device);
              }
            }
          } else if (target.id === 'le-scan') {
            if (this.scanning) {
              this._bluetoothManager.safelyStopLeScan().then(function() {
                that.scanning = false;
              });
            } else {
              this._truncateDevices().then(function() {
                that._bluetoothManager.safelyStartLeScan([]).then(function() {
                  that.scanning = true;
                });
              });
            }
          }
          break;
      }
    },

    createDeviceElem: function(device) {
      var elem = document.createElement('div');
      var addressElem = document.createElement('span');
      var nameElem = document.createElement('span');
      var connectButton = document.createElement('button');

      addressElem.textContent = '[' + device.address + ']';
      nameElem.textContent = device.name;
      connectButton.dataset.address = device.address;
      connectButton.textContent = 'Connect';
      connectButton.classList.add('connect');
      connectButton.addEventListener('click', this);

      elem.appendChild(connectButton);
      elem.appendChild(addressElem);
      elem.appendChild(nameElem);
      elem.id = 'device-' + device.address;
      elem.dataset.isConnected = false;
      elem.classList.add('device');

      return elem;
    }
  });

  exports.BleServer = BleServer;
}(window));
