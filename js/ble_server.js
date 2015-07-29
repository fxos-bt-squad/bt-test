/* global BluetoothManager*/
'use strict';

(function(exports) {
  var BleServer = function() {};

  BleServer.prototype = {
    adapterStateElem: document.getElementById('ble-server-adapter-state'),
    discoveringStateElem:
      document.getElementById('ble-server-discovering-state'),
    devicesListElem: document.getElementById('ble-server-devices-list'),

    _bluetoothManager: undefined,

    _app: undefined,

    _ready: false,

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
    },

    turnOn: function() {
      var that = this;
      if (!this._ready) {
        this._truncateDeviceElem().then(function() {
          that._bluetoothManager.on('device-found', that.handleDeviceFound);
          that._bluetoothManager.safelyStartLeScan([]);
          that._ready = true;
        });
      }
    },

    turnOff: function() {
      if (this._ready) {
        this._truncateDeviceElem();
        this._bluetoothManager.off('device-found', this.handleDeviceFound);
        this._bluetoothManager.safelyDisable();
        this._ready = false;
      }
    },

    _truncateDeviceElem: function() {
      var that = this;
      return new Promise(function(resolve, reject) {
        [].forEach.call(that.devicesListElem.children, function(childElem) {
          that.devicesListElem.removeChild(childElem);
        });
        resolve();
      });
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
      console.log('['+device.address + '] ' + device.name + ' (' +
        device.type + ')');
      this.devicesListElem.appendChild(this.createDeviceElem(device));
    },

    createDeviceElem: function(device) {
      var elem = document.createElement('div');
      var addressElem = document.createElement('span');
      var nameElem = document.createElement('span');

      addressElem.textContent = '[' + device.address + ']';
      nameElem.textContent = device.name;

      elem.appendChild(addressElem);
      elem.appendChild(nameElem);
      elem.classList.add('device');

      return elem;
    }
  };

  exports.BleServer = BleServer;
}(window));
