/* global $ */

 (function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.ui = exports.classic.ui || {};

  var utils = exports.classic.utils;
  var ui = exports.classic.ui;

  /**
   * An UI component represents a switch.
   *
   * It supports turing on/off operations.
   *
   * @param handler an event handler object, which should include below methods:
   *     .onTurnOn -- called when the user tries to turn on the switch.
   *     .onTurnOff -- called when the user tries to turn off the switch.
   *     .onCancelTurnOn -- called when the user tries to turn off the switch
   *         while the current state is "turning on".
   *     .onCancelTurnOff -- called when the user tries to turn on the switch
   *         while the current state is "turning off".
   * @param defaultState the default state of this switch.
   * @param enable whether this switch is enabled or not in default.
   */
  ui.SwitchButton = function(handler, defaultState, enable) {
    this._selector = $(window.document.createElement('div')).slider({max: 2});
    this._selector.addClass('classic-ui-switch-button');
    this._selector.slider('disable');
    this._handler = handler;
    this._state = '';
    this._enable = null;

    this._selector.click(this._onClick.bind(this));

    this.state = (defaultState !== undefined ? defaultState : this.STATE.OFF);
    this.enable = (enable !== undefined ? enable : true);
  };

  /**
   * Enumerate of the states of `ui.SwitchButton`
   */
  ui.SwitchButton.STATE = Object.freeze({
    OFF: 'off',
    TURNING_ON: 'turning-on',
    TURNING_OFF: 'turning-off',
    ON: 'on'
  });

  ui.SwitchButton.prototype = {
    /**
     * This reference allows accessing the enumerate of states by both
     * `ui.SwitchButton.STATE` and `someInstanceOfSwitchButton.STATE`.
     */
    STATE: ui.SwitchButton.STATE,

    /**
     * Returns the current state.
     */
    get state() { return this._state; },

    /**
     * Sets the current state.
     *
     * @param state one of the option in `ui.SwitchButton.STATE`
     */
    set state(state) {
      var prefix = 'classic-ui-switch-button-state-';
      this._selector.removeClass(prefix + this._state);
      this._state = state;
      this._selector.addClass(prefix + this._state);
      if (state == this.STATE.OFF) {
        this._selector.slider('value', 0);
      } else if (state == this.STATE.ON) {
        this._selector.slider('value', 2);
      } else {
        this._selector.slider('value', 1);
      }
    },

    /**
     * Returns whether this switch is enabled or not.
     */
    get enable() { return this._enable; },

    /**
     * Sets whether this switch is enabled or not.
     *
     * @param state true if you want to enable this switch.
     */
    set enable(state) { this._enable = state; },

    get selector() { return this._selector; },

    destroy: function() { this._selector.remove(); },

    _onClick: function() {
      if (!this._enable) {
        return;
      }
      if (this._state == this.STATE.OFF) {
        this._handler.onTurnOn();
      } else if (this._state == this.STATE.TURNING_ON) {
        this._handler.onCancelTurnOn();
      } else if (this._state == this.STATE.TURNING_OFF) {
        this._handler.onCancelTurnOff();
      } else {
        this._handler.onTurnOff();
      }
    }
  };

  /**
   * Base class for a block in a tab.
   *
   * While the block is expanded, all elements inside it are visible;  otherwise
   * some of them are hidden.
   *
   * @param isExpanded whether this block should be expanded or not in default.
   */
  ui.Block = function(isExpanded) {
    this._hideableChildren = [];
    this._isExpanded = false;
    this._selector = $(window.document.createElement('div'));
    this._selector.addClass('classic-ui-block');

    this.isExpanded = (isExpanded !== undefined ? isExpanded : true);
  };

  ui.Block.prototype = {
    /**
     * Returns true if this block is expanded.
     */
    get isExpanded() { return this._isExpanded; },

    /**
     * Sets whether this block is expanded or not.
     *
     * @param state true for expanding this block.
     */
    set isExpanded(state) {
      this._isExpanded = state;
      for (var i = 0; i < this._hideableChildren.length; ++i) {
        this._hideableChildren[i].css('display', state ? '' : 'none');
      }
    },

    /**
     * Toggles the state of whether this block is expanded or not.
     */
    toggleExpand: function() { this.isExpanded = !this.isExpanded; },

    /**
     * Returns the jquery selector representing this block ui component.
     */
    get selector() { return this._selector; },

    /**
     * Adds an jquery selector as a child of this ui component.
     *
     * @param selector the jquery selector to be added.
     * @param index the position to insert.
     * @param hideable whether this child selector should hide when this block
     *     is not expanded or not.
     */
    addChildSelector: function(selector, index, hideable) {
      index = Math.max(0, index);
      if (this._selector.children().length <= index) {
        this._selector.append(selector);
      } else {
        this._selector.children()[index].before(selector);
      }
      if (hideable) {
        this._hideableChildren.push(selector);
        if (!this._isExpanded) {
          selector.css('display', 'none');
        }
      }
    },

    /**
     * Destroys the whole ui components, which includes all the children.
     */
    destroy: function() { this._selector.remove(); }
  };

  ui.SwitchButtonBlock = function(
      handler, name, description, defaultState, enable) {
    ui.Block.call(this, false);
    var title = $(window.document.createElement('div'));
    var titleLeft = $(window.document.createElement('div'));
    var titleRight = $(window.document.createElement('div'));
    title.addClass('switch-button-title');
    titleLeft.addClass('left');
    titleRight.addClass('right');
    title.append(titleLeft).append(titleRight);
    this._button = new ui.SwitchButton(handler, defaultState, enable);
    titleLeft.append(this._button.selector);
    titleRight.html(name);
    titleRight.click(this.toggleExpand.bind(this));

    var body = $(window.document.createElement('div'));
    body.addClass('switch-button-body').html(description);

    this.addChildSelector(title, 0, false);
    this.addChildSelector(body, 1, true);
  };

  ui.SwitchButtonBlock.STATE = ui.SwitchButton.STATE;

  ui.SwitchButtonBlock.prototype = {
    STATE: ui.SwitchButtonBlock.STATE,

    get enable() { return this._button.enable; },
    set enable(state) { this._button.enable = state; },

    get state() { return this._button.state; },
    set state(state) { this._button.state = state; },

    destroy: function() {
      this._button.destroy();
      this.selector.remove();
    }
  };

  utils.setInheritFrom(ui.SwitchButtonBlock, ui.Block);

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
