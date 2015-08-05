/* global $ */

(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.ui = exports.classic.ui || {};

  var utils = exports.classic.utils;
  var ui = exports.classic.ui;

  /**
   * Creates a DOM element and wraps it by a jquery selector.
   *
   * @param {string} nodeName - The name of the DOM element to be created.
   * @param {string=} className - Additional classes to add if needs.
   * @returns {Object} A jquery selector contains only the element created.
   */
  var _createSelector = function(nodeName, className) {
    var selector = $(document.createElement(nodeName));
    if (className !== undefined) {
      selector.addClass(className);
    }
    return selector;
  };

  /**
   * Creates a jquery selector which contains a DOM element for classic-ui.
   * It adds a class "classic-ui" to the DOM element so we can write css
   * classes only for elements in class-ui's components easily.
   *
   * @see _createSelector
   */
  var _createClassicUISelector = function(nodeName, className) {
    return _createSelector(nodeName, className).addClass('classic-ui');
  };

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
    this._selector = _createClassicUISelector('div', 'switch-button');
    this._selector.slider({max: 2}).slider('disable');
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
    get state() {
      return this._state;
    },

    /**
     * Sets the current state.
     *
     * @param state one of the option in `ui.SwitchButton.STATE`
     */
    set state(state) {
      var prefix = 'state-';
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
    get enable() {
      return this._enable;
    },

    /**
     * Sets whether this switch is enabled or not.
     *
     * @param state true if you want to enable this switch.
     */
    set enable(state) {
      this._enable = state;
    },

    get selector() {
      return this._selector;
    },

    destroy: function() {
      this._selector.remove();
    },

    _onClick: function() {
      if (!this._enable) {
        return;
      }
      if (this._state == this.STATE.OFF) {
        utils.callMethodIfIsFunction(this._handler, 'onTurnOn', this);
      } else if (this._state == this.STATE.TURNING_ON) {
        utils.callMethodIfIsFunction(this._handler, 'onCancelTurnOn', this);
      } else if (this._state == this.STATE.TURNING_OFF) {
        utils.callMethodIfIsFunction(this._handler, 'onCancelTurnOff', this);
      } else {
        utils.callMethodIfIsFunction(this._handler, 'onTurnOff', this);
      }
    }
  };

  ui.Input = function(selector) {
    this._selector = selector;
  };

  ui.Input.prototype = {
    get value() {
      return this._selector.val();
    },
    set value(value) {
      this._selector.val(value);
    },
    get selector() {
      return this._selector;
    },
    destroy: function() {
      this._selector.remove();
    }
  };

  ui.NumberInput = function(handler, minValue, maxValue, step, defaultValue) {
    ui.Input.call(this, _createClassicUISelector('input', 'number-input'));
    this.selector.attr('type', 'number');
    this.selector.attr('min', minValue);
    this.selector.attr('max', maxValue);
    this.selector.attr('step', step);
    this.selector.val(defaultValue);
    this.selector.change(
        utils.callThisMethodIfIsFunction.bind(handler, 'onChange', this));
  };

  ui.NumberInput.prototype = {};

  utils.setInheritFrom(ui.NumberInput, ui.Input);

  ui.StringInput = function(handler, defaultValue) {
    ui.Input.call(this, _createClassicUISelector('input', 'string-input'));
    this.selector.attr('type', 'text').val(defaultValue);
    this.selector.change(
        utils.callThisMethodIfIsFunction.bind(handler, 'onChange', this));
  };

  ui.StringInput.prototype = {};

  utils.setInheritFrom(ui.StringInput, ui.Input);

  ui.OptionsInput = function(handler, options, defaultValue) {
    ui.Input.call(this, _createClassicUISelector('select', 'options-input'));
    for (var i = 0; i < options.length; ++i) {
      var option = _createSelector('option');
      option.attr('value', options[i]).html(options[i]);
      if (options[i] == defaultValue) {
        option.attr('selected', 'selected');
      }
      this.selector.append(option);
    }
    this.selector.change(
        utils.callThisMethodIfIsFunction.bind(handler, 'onChange', this));
  };

  ui.OptionsInput.prototype = {
    addOption: function(option, index) {
      index = Math.max(0, index);
      var optionElement = _createSelector('option');
      optionElement.attr('value', option).html(option);
      if (this.selector.children().length <= index) {
        this.selector.append(optionElement);
      } else {
        this.sleector.children()[index].before(optionElement);
      }

      return this;
    },
    removeOption: function(option) {
      var children = this.selector.children();
      for (var i = 0; i < children.length; ++i) {
        if (children[i].attr('value') == option) {
          children[i].remove();
          break;
        }
      }
      return this;
    }
  };

  utils.setInheritFrom(ui.OptionsInput, ui.Input);

  /**
   * Base class for a block in a tab.
   *
   * While the block is expanded, all elements inside it are visible;  otherwise
   * some of them are hidden.
   *
   * @constructor
   * @param {string} className - Additional class name of the DOM element.
   * @param {Boolean} isExpanded - Whether this block should be expanded or not
   *     in default.
   */
  ui.Block = function(className, isExpanded) {
    this._selector = _createClassicUISelector('div');
    this._selector.addClass('block ' + className);

    this._isExpanded = isExpanded;

    this._hideableChildren = [];
  };

  ui.Block.prototype = {
    /**
     * Returns true if this block is expanded.
     */
    get isExpanded() {
      return this._isExpanded;
    },

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
    toggleExpand: function() {
      this.isExpanded = !this.isExpanded;
    },

    /**
     * Returns the jquery selector representing this block ui component.
     */
    get selector() {
      return this._selector;
    },

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
    destroy: function() {
      this._selector.remove();
    }
  };

  ui.SwitchButtonBlock = function(
      handler, name, description, defaultState, enable) {
    ui.Block.call(this, 'switch-button-block', false);
    var title = _createSelector('div', 'title');
    var titleLeft = _createSelector('div', 'left');
    var titleRight = _createSelector('div', 'right');
    title.append(titleLeft, titleRight);
    this._button = new ui.SwitchButton(handler, defaultState, enable);
    titleLeft.append(this._button.selector);
    titleRight.html(name);
    titleRight.click(this.toggleExpand.bind(this));

    var body = _createSelector('div', 'body').html(description);

    this.addChildSelector(title, 0, false);
    this.addChildSelector(body, 1, true);
  };

  ui.SwitchButtonBlock.STATE = ui.SwitchButton.STATE;

  ui.SwitchButtonBlock.prototype = {
    STATE: ui.SwitchButtonBlock.STATE,

    get enable() {
      return this._button.enable;
    },
    set enable(state) {
      this._button.enable = state;
    },

    get state() {
      return this._button.state;
    },
    set state(state) {
      this._button.state = state;
    },

    destroy: function() {
      this._button.destroy();
      this.selector.remove();
    }
  };

  utils.setInheritFrom(ui.SwitchButtonBlock, ui.Block);

  ui.ExecutionBlock = function(handler, name, description) {
    ui.Block.call(this, 'execution-block', false);

    var title = _createSelector('div', 'title').html(name);
    title.click(this.toggleExpand.bind(this));

    var descriptionDiv = _createSelector('div', 'description').html(description);

    this._body = _createSelector('div', 'body');

    this._buttonDiv = _createSelector('div', 'button');
    this._buttonDiv.click(this._buttonOnClickHandler.bind(this));

    this._state = {};

    this._statusDiv = _createSelector('div', 'status');
    this._progressBar = _createSelector('div', 'progress-bar').progressbar();

    this._inputs = {};
    this._handler = handler;

    var navLeft = _createSelector('div', 'left');
    var nav = _createSelector('div', 'nav');
    navLeft.append(this._statusDiv, this._progressBar);
    nav.append(navLeft, this._buttonDiv);

    this.addChildSelector(title, 0, false);
    this.addChildSelector(descriptionDiv, 1, true);
    this.addChildSelector(this._body, 2, true);
    this.addChildSelector(nav, 3, false);

    this.state = this.STATE.PENDING;
  };

  ui.ExecutionBlock.STATE = {
    PENDING: Object.freeze({buttonCaption: 'start', handlerName: 'onStart'}),
    STARTING: Object.freeze({buttonCaption: 'starting'}),
    RUNNING: Object.freeze({buttonCaption: 'stop', handlerName: 'onStop'}),
    STOPPING: Object.freeze({buttonCaption: 'stopping'})
  };

  ui.ExecutionBlock.prototype = {
    STATE: ui.ExecutionBlock.STATE,
    addParameter: function(name, input, index) {
      var nameDiv = _createSelector('div', 'name').text(name);
      var inputDiv = _createSelector('div', 'input').append(input);
      var rowDiv = _createSelector('div', 'input-row').append(nameDiv, inputDiv);
      this._body.insertAt(rowDiv, index);
      this._inputs[name] = {selector: input, rowDiv: rowDiv};
    },
    removeParameter: function(name) {
      this._inputs[name].selector.destroy();
      this._inputs[name].rowDiv.remove();
      this._inputs[name] = null;
    },
    get state() {
      return this._state;
    },
    set state(state) {
      this._buttonDiv.removeClass('state-' + this._state.buttonCaption);
      this._buttonDiv.addClass('state-' + state.buttonCaption);
      this._buttonDiv.text(state.buttonCaption);
      this._state = state;
    },
    get status() {
      this._statusDiv.html();
    },
    set status(value) {
      this._statusDiv.html(value);
    },
    get progressRate() {
      return this._progressBar.progressbar('option', 'value') / 100;
    },
    set progressRate(value) {
      return this._progressBar.progressbar('option', 'value', value * 100);
    },
    _buttonOnClickHandler: function(evt) {
      if (this._state.hasOwnProperty('handlerName')) {
        utils.callMethodIfIsFunction(
            this._handler, this._state.handlerName, this);
      }
    }
  };

  utils.setInheritFrom(ui.ExecutionBlock, ui.Block);

  ui.PlayButtonBlock = function(handler, name, description, defaultEnable) {
    ui.Block.call(this, 'play-button-block', false);

    var title = _createSelector('div', 'title');
    var titleLeft = _createSelector('div', 'left');
    var titleRight = _createSelector('div', 'right');
    var playButton = _createSelector('span', 'ui-icon ui-icon-play');
    title.append(titleLeft.html(name), titleRight.append(playButton));
    titleLeft.click(this.toggleExpand.bind(this));
    playButton.click(this._onPlay.bind(this));

    var body = _createSelector('div', 'body').html(description);

    this.addChildSelector(title, 0, false);
    this.addChildSelector(body, 1, true);

    this._handler = handler;
    this._enable = null;

    this.enable = (defaultEnable !== undefined ? defaultEnable : true);
  };

  ui.PlayButtonBlock.prototype = {
    get enable() {
      return this._enable;
    },
    set enable(state) {
      this._enable = state;
    },
    _onPlay: function() {
      if (this._enable) {
        utils.callMethodIfIsFunction(this._handler, 'onPlay', this);
      }
    }
  };

  utils.setInheritFrom(ui.PlayButtonBlock, ui.Block);

  ui.Tab = function(handler) {
    this._id = utils.createUniqueId();

    this._title = _createClassicUISelector('li', 'tab title');
    this._titleLink = _createSelector('a').attr('href', '#' + this._id);
    this._titleCloseButton = _createSelector('span', 'ui-icon ui-icon-close');
    this._titleCloseButton.attr('role', 'presentation');
    this._titleCloseButton.click(
        utils.callThisMethodIfIsFunction.bind(this._handler, 'onClose', this));
    this._title.append(this._titleLink, this._titleCloseButton);

    this._body = _createClassicUISelector('div', 'tab body');
    this._body.attr('id', this._id);

    this._blocks = [];
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
    }
  };

  ui.TabsManager = function() {
    this._body = _createClassicUISelector('div', 'tabs-manager body');
    this._titleBar = _createClassicUISelector('ul', 'tabs-manager title');
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
