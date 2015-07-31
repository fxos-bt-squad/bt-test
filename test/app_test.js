/* global describe, before, after, it, App */
'use strict';

describe('app', function() {

  var setupHTML = function(targetElem) {
    document.body.dataset.mode = 'classic-api';
    var testFragment = document.createDocumentFragment();

    var classicSection = document.createElement('section');
    classicSection.id = 'classic-api';
    classicSection.className = 'panel';
    testFragment.appendChild(classicSection);

    var bleServerSection = document.createElement('section');
    bleServerSection.id = 'ble-server-api';
    bleServerSection.className = 'panel';
    bleServerSection.hidden = true;
    testFragment.appendChild(bleServerSection);

    var bleClientSection = document.createElement('section');
    bleClientSection.id = 'ble-client-api';
    bleClientSection.className = 'panel';
    bleClientSection.hidden = true;
    testFragment.appendChild(bleClientSection);

    var controlPanel = document.createElement('section');
    controlPanel.id = 'control-panel';
    var controlPanelContainer = document.createElement('div');
    var classicButton = document.createElement('button');
    classicButton.id = 'classic-api-button';
    classicButton.className = 'mode-button';
    classicButton.disabled = 'disabled';
    controlPanelContainer.appendChild(classicButton);

    var bleServerButton = document.createElement('button');
    bleServerButton.id = 'ble-server-api-button';
    bleServerButton.className = 'mode-button';
    controlPanelContainer.appendChild(bleServerButton);

    var bleClientButton = document.createElement('button');
    bleClientButton.id = 'ble-client-api-button';
    bleClientButton.className = 'mode-button';
    controlPanelContainer.appendChild(bleClientButton);

    controlPanel.appendChild(controlPanelContainer);
    testFragment.appendChild(controlPanel);

    targetElem.appendChild(testFragment);
  };

  var teardownHTML = function() {
    delete document.body.dataset.mode;
  };

  var FakeBleServer = function() {};
  FakeBleServer.prototype = {
    start: function() {}
  };

  describe('interface of App', function() {
    var testDocument;
    var realClassic;
    var realDollorSign;
    var realBleServer;

    before(function() {
      testDocument = document.getElementById('test-document');
      setupHTML(testDocument);

      realBleServer = window.BleServer;
      window.BleServer = FakeBleServer;

      realClassic = window.classic;
      window.classic = {
        start: function() {}
      };

      realDollorSign = window.$;
      window.$ = function() {};
    });

    after(function() {
      testDocument.innerHTML = '';
      teardownHTML();
      window.BleServer = realBleServer;
      window.classic = realClassic;
      window.$ = realDollorSign;
      delete window.app;
    });

    it('should expose as a Class in window', function() {
      window.should.have.property('App');
    });

    it('should be able to instantialize through "new" keyword', function() {
      var app = new App();
      app.start();

      app.should.be.ok();
    });
  });
});
