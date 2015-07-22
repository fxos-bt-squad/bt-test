/* global $ */

 (function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.ui = exports.classic.ui || {};

  var utils = exports.classic.utils;
  var ui = exports.classic.ui;

  ui.Tab = function(handler) {
    this._id = utils.createUniqueId();

    this._title = $(window.document.createElement('li'));
    this._title.addClass('classic-ui-tab-title');
    this._titleLink = $(window.document.createElement('a'));
    this._titleLink.attr('href', '#' + this._id);
    this._titleCloseButton = $(window.document.createElement('span'));
    this._titleCloseButton.addClass('ui-icon');
    this._titleCloseButton.addClass('ui-icon-close');
    this._titleCloseButton.attr('role', 'presentation');
    this._titleCloseButton.click(this._onCloseButtonClicked.bind(this));
    this._title.append(this._titleLink);
    this._title.append(this._titleCloseButton);

    this._body = $(window.document.createElement('div'));
    this._body.attr('id', this._id);

    this._blocks = [];

    this._handler = handler;
  };

  ui.Tab.prototype = {
    get name() {
      return this._titleLink.html();
    },
    set name(name) {
      return this._titleLink.html(name);
    },

    addBlock: function(block, index) {
      index = Math.max(index, 0);
      if (index >= this._blocks.length) {
        this._body.append(block.selector);
        this._blocks.push(block);
      } else {
        this._body.children()[index].before(block.selector);
        this._blocks.splice(index, 0, block);
      }
      return this;
    },
    removeBlock: function(block) {
      var index = this._blocks.indexOf(block);
      if (index >= 0) {
        block.selector.detach();
        this._blocks.splice(index, 1);
      }
      return this;
    },

    get titleSelector() {
      return this._title;
    },
    get bodySelector() {
      return this._body;
    },

    destroy: function() {
      for (var i = 0; i < this._blocks; ++i) {
        this._blocks[i].selector.detach();
      }
      this._title.remove();
      this._body.remove();
      return this;
    },

    _onCloseButtonClicked: function() {
      this._handler.onClose();
    }
  };

  ui.TabsManager = function() {
    this._body = $(document.createElement('div'));
    this._titleBar = $(document.createElement('ul'));
    this._body.append(this._titleBar);

    this._body.tabs({});
  };

  ui.TabsManager.prototype = {
    addTab: function(tab) {
      this._titleBar.append(tab.titleSelector);
      this._body.append(tab.bodySelector);

      this._body.tabs('refresh');
      this._body.tabs('option', 'active', this._titleBar.children().length - 1);

      return this;
    },

    removeTab: function(tab) {
      tab.titleSelector.detach();
      tab.bodySelector.detach();

      this._body.tabs('refresh');

      return this;
    },

    get selector() {
      return this._body;
    }
  };
})(window);
