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
   * @param {String} nodeName - Name of the DOM element to be created.
   * @param {String} className - (optional) Additional classes to add if needs.
   * @returns {jQuery} A jquery selector contains only the element created.
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
   *
   * It adds a class "classic-ui" to the DOM element so we can write css
   * classes only for elements in class-ui's components easily.
   *
   * @see _createSelector
   */
  var _createClassicUISelector = function(nodeName, className) {
    return _createSelector(nodeName, className).addClass('classic-ui');
  };

  /**
   * Base class for ui components.
   *
   * An ui component is a bridge for communication between the user and
   * the backend handler.  It passes all the related events to
   * specified event handlers gived by the backend handler.  And all
   * the controlling rights are belone to the backend, which includes
   * the state, shape, enabling, etc.
   *
   * In implementation level, it contains a jquery selector for
   * managering DOM elements and lots of methods to control it.  While
   * constructing, the backend should provide a dict of event handlers
   * to catch various kinds of events trigger by the front end.
   *
   * @constructor
   * @param {jQuery} selector - A jquery selector contains the main DOM
   *     element.
   * @param {Object} handler - A dict of event handlers.
   */
  ui.Component = function(selector, handler) {
    this._selector = selector;
    this._handler = handler;
  };

  ui.Component.prototype = {
    /**
     * @returns {jQuery} Gets the jquery selector which contains the main
     *     DOM element(s).
     */
    get selector() {
      return this._selector;
    },

    /**
     * Destroys this ui component, which includes the jquery selector.
     *
     * After calling this method, this ui component is no more useable.
     */
    destroy: function() {
      this.selector.remove();
    },

    /**
     * Calls an event handler.
     *
     * @param {String} handlerName - Name of the event handler.
     * @param {} args - Arguments to pass to the event handler.
     * @returns {} The return value of the event handler.
     */
    _callBackendEventHandler: function(handlerName, args) {
      args = [this].concat(utils.argsObjToArray(arguments, 1));
      if (this._handler.hasOwnProperty(handlerName)) {
        return this._handler[handlerName].apply(this._handler, args);
      }
    }
  };

  /**
   * An UI component represents a switch button.
   *
   * It supports turing on/off operations.
   *
   * The related events are:
   *   onTurnOn - Called when the user tries to turn on the switch.
   *   onTurnOff - Called when the user tries to turn off the switch.
   *   onCancelTurnOn - Called when the user tries to cancel the turning
   *       on procedure.
   *   onCancelTurnOff - Called when the user tries to cancel the turning
   *       off procedure.
   *
   * @constructor
   * @param {Object} handler - A dict of event handlers.
   * @param {ui.SwitchButton._StateInfo} defaultState - (optional) The default
   *     state.  The default value is `ui.SwitchButton.STATE.OFF`
   * @param {Boolean} defaultEnabling - (optional) Whether this ui component is
   *     enabled or not.  The default value is false.
   */
  ui.SwitchButton = function(handler, defaultState, defaultEnabling) {
    ui.Component.call(
        this, _createClassicUISelector('div', 'switch-button'), handler);
    this.selector.slider({max: 2}).slider('disable');
    this.selector.click(this._onClick.bind(this));

    this._state = this.STATE.OFF;
    this._enable = false;

    if (defaultState !== undefined) {
      this.state = defaultState;
    }
    if (defaultEnabling !== undefined) {
      this.enable = defaultEnabling;
    }
  };

  ui.SwitchButton._StateInfo = function(className, handlerName, sliderValue) {
    this.className = className;
    this.handlerName = handlerName;
    this.sliderValue = sliderValue;
  };

  /**
   * Enumerate of the states of `ui.SwitchButton`
   */
  ui.SwitchButton.STATE = Object.freeze({
    /**
     * Means that the switch is currently off, user can click it to turn on it.
     */
    OFF: new ui.SwitchButton._StateInfo('state-off', 'onTurnOn', 0),

    /**
     * Means that the switch is turning on, user can click it to try to cancel
     * the turning on progress.
     */
    TURNING_ON: new ui.SwitchButton._StateInfo('state-turning-on',
                                               'onCancelTurnOn', 1),

    /**
     * Means that the switch is turning off, user can click it to try to cancel
     * the turning off progress.
     */
    TURNING_OFF: new ui.SwitchButton._StateInfo('state-turning-off',
                                                'onCancelTurnOff', 1),
    /**
     * Means that the switch is turning on, user can click it to turn off it.
     */
    ON: new ui.SwitchButton._StateInfo('state-on', 'onTurnOff', 2)
  });

  ui.SwitchButton.prototype = {
    /**
     * This reference allows accessing the enumerate of states by both
     * `ui.SwitchButton.STATE` and `someInstanceOfSwitchButton.STATE`.
     */
    STATE: ui.SwitchButton.STATE,

    /**
     * @returns {ui.SwitchButton._StateInfo} Gets the current state.
     */
    get state() {
      return this._state;
    },

    /**
     * Sets the current state.
     *
     * @param {ui.SwitchButton._StateInfo} The new state.
     */
    set state(state) {
      this.selector.removeClass(this._state.className);
      this.selector.addClass(state.className);
      this.selector.slider('value', state.sliderValue);
      this._state = state;
    },

    /**
     * @returns {Boolean} Whether this switch button is enabled or not.
     */
    get enable() {
      return this._enable;
    },

    /**
     * Sets whether this switch button is enabled or not.
     *
     * @param {Boolean} True for enabling.
     */
    set enable(state) {
      this._enable = state;
    },

    _onClick: function() {
      if (this._enable) {
        this._callBackendEventHandler(this._state.handlerName);
      }
    }
  };

  utils.setInheritFrom(ui.SwitchButton, ui.Component);

  /**
   * Base class for ui components which are used for inputing value.
   *
   * It defines the basic methods/getters/setters of an ui component for
   * inputing value.
   * An inputing component will call the `onChange` event handler while
   * the value is changed.
   *
   * @constructor
   * @param {jQuery} selector - The main selector contains this ui component.
   * @param {Object} handler - A dict of event handlers.
   */
  ui.Input = function(selector, handler) {
    ui.Component.call(this, selector, handler);
  };

  ui.Input.prototype = {
    /**
     * @returns {} Gets the value of this input ui component.
     */
    get value() {
      return this.selector.val();
    },

    /**
     * Sets the value of this input ui component.
     *
     * @param {} value The new value.
     */
    set value(value) {
      this.selector.val(value);
    },

    /**
     * Triggers the procedure for calling the `onChange` event handler.
     */
    _triggerValueChanged: function() {
      this._callBackendEventHandler('onChange', this.value);
    }
  };

  utils.setInheritFrom(ui.Input, ui.Component);

  /**
   * An ui component for inputing a number.
   *
   * @constructor
   * @param {Object} handler - A dict of event handers.
   * @param {Number} minValue - The minimum accepted value.
   * @param {Number} maxValue - The maximum accepted value.
   * @param {Number} step - The step.
   * @param {Number} defaultValue - (optional) The default value.
   */
  ui.NumberInput = function(handler, minValue, maxValue, step, defaultValue) {
    ui.Input.call(
        this, _createClassicUISelector('input', 'number-input'), handler);
    this.selector.attr('type', 'number');
    this.selector.attr('min', minValue);
    this.selector.attr('max', maxValue);
    this.selector.attr('step', step);
    this.selector.change(this._triggerValueChanged.bind(this));

    if (defaultValue !== undefined) {
      this.value = defaultValue;
    }
  };

  ui.NumberInput.prototype = {};

  utils.setInheritFrom(ui.NumberInput, ui.Input);

  /**
   * An ui component for inputing a string.
   *
   * @constructor
   * @param {Object} handler - A dict of event handers.
   * @param {String} defaultValue - (optional) The default string value.
   */
  ui.StringInput = function(handler, defaultValue) {
    ui.Input.call(
        this, _createClassicUISelector('input', 'string-input'), handler);
    this.selector.attr('type', 'text').val(defaultValue);
    this.selector.change(this._triggerValueChanged.bind(this));

    if (defaultValue !== undefined) {
      this.value = defaultValue;
    }
  };

  ui.StringInput.prototype = {};

  utils.setInheritFrom(ui.StringInput, ui.Input);

  /**
   * An ui component for selecting option from a list of options.
   *
   * @constructor
   * @param {Object} handler - A dict of event handers.
   * @param {Array} options - A list of string elements.
   * @param {String} defaultOption - (optional) The default option.
   */
  ui.OptionsInput = function(handler, options, defaultOption) {
    ui.Input.call(
        this, _createClassicUISelector('select', 'options-input'), handler);
    this.selector.change(this._triggerValueChanged.bind(this));

    for (var i = 0; i < options.length; ++i) {
      this.addOption(options[i], i);
    }

    if (defaultOption !== undefined) {
      this.value = defaultOption;
    }
  };

  ui.OptionsInput.prototype = {
    /**
     * Adds an option to this selection input component.
     *
     * @param {String} option - The new option.
     * @param {Number} index - The index of the new option to be placed at.
     * @returns {ui.OptionsInput} `this` object.
     */
    addOption: function(option, index) {
      var optionElement = _createSelector('option');
      optionElement.attr('value', option).html(option);
      this.selector.insertAt(optionElement, index);

      return this;
    },

    /**
     * Removes an option from this selection input component.
     *
     * @param {String} option - The option value to be removed.
     * @returns {ui.OptionsInput} `this` object.
     */
    removeOption: function(option) {
      var children = this.selector.children();
      for (var i = 0; i < children.length; ++i) {
        if ($(children[i]).attr('value') == option) {
          $(children[i]).remove();
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
   * While the block is expanded, all elements inside it are visible;
   * otherwise some of them are hidden.
   * It has no general related events.
   *
   * @constructor
   * @param {String} className - Additional class name of the DOM element.
   * @param {Object} handler - A dict of event handlers.
   * @param {Boolean} isExpanded - Whether this block should be expanded or not
   *     in default.
   */
  ui.Block = function(className, handler, isExpanded) {
    ui.Component.call(
        this, _createClassicUISelector('div', 'block ' + className), handler);

    this._isExpanded = isExpanded;

    this._hideableSelectors = $();
  };

  ui.Block.prototype = {
    /**
     * @returns {Boolean} True if this block is expanded.
     */
    get isExpanded() {
      return this._isExpanded;
    },

    /**
     * Sets whether this block is expanded or not.
     *
     * @param {Boolean} state - True for expanding this block.
     */
    set isExpanded(state) {
      this._isExpanded = state;
      this._setCSSValue(this._hideableSelectors);
    },

    /**
     * Toggles the state of whether this block is expanded or not.
     */
    toggleExpand: function() {
      this.isExpanded = !this.isExpanded;
    },

    /**
     * Adds hideable children selectors.
     *
     * @param {jQuery} selector - The jquery selector which should be
     *     hidden if this block is not expanded.
     * @param {} args - Same as above.
     * @returns {ui.Block} `this` object.
     */
    _addHideableChildren: function(selector, args) {
      args = utils.argsObjToArray(arguments);
      for (var i = 0; i < args.length; ++i) {
        this._setCSSValue(args[i]);
        this._hideableSelectors = this._hideableSelectors.add(args[i]);
      }

      return this;
    },

    _setCSSValue: function(selector) {
      selector.css('display', this._isExpanded ? '' : 'none');
    }
  };

  utils.setInheritFrom(ui.Block, ui.Component);

  /**
   * A block ui component contains a switch button.
   *
   * All the related event handlers are equals to ones in `ui.SwitchButton`.
   *
   * @constructor
   * @param {Object} handler - A dict of event handlers.
   * @param {String} name - The name of this block.
   * @param {String} description - The description text to show.
   * @param {ui.SwitchButton._StateInfo} defaultState - The default state.
   * @param {Boolean} enable - Whether the switch button is enabled or not
   *     in default.
   */
  ui.SwitchButtonBlock = function(
      handler, name, description, defaultState, enable) {
    ui.Block.call(this, 'switch-button-block', handler, false);

    this._button = new ui.SwitchButton(handler, defaultState, enable);

    var title = _createSelector('div', 'title');

    var titleLeft = _createSelector('div', 'left');
    titleLeft.append(this._button.selector);

    var titleRight = _createSelector('div', 'right');
    titleRight.html(name).click(this.toggleExpand.bind(this));

    var body = _createSelector('div', 'body').html(description);

    this.selector.append(title.append(titleLeft, titleRight), body);
    this._addHideableChildren(body);
  };

  ui.SwitchButtonBlock.STATE = ui.SwitchButton.STATE;

  ui.SwitchButtonBlock.prototype = {
    STATE: ui.SwitchButtonBlock.STATE,

    /**
     * @see {ui.SwitchButton.prototype.enable}
     */
    get enable() {
      return this._button.enable;
    },

    /**
     * @see {ui.SwitchButton.prototype.enable}
     */
    set enable(state) {
      this._button.enable = state;
    },

    /**
     * @see {ui.SwitchButton.prototype.state}
     */
    get state() {
      return this._button.state;
    },

    /**
     * @see {ui.SwitchButton.prototype.state}
     */
    set state(state) {
      this._button.state = state;
    },

    /**
     * @see {ui.Component.prototype.destroy}
     */
    destroy: function() {
      this._button.destroy();
      this.selector.remove();
    }
  };

  utils.setInheritFrom(ui.SwitchButtonBlock, ui.Block);

  /**
   * A block ui component contains a play button.
   *
   * It contains only one related event -- `onPlay`, which will be called
   * if the user click on the play button.
   *
   * @constructor
   * @param {Object} handler - A dict of event handlers.
   * @param {String} name - The name of this block.
   * @param {String} description - The description text to show.
   * @param {Boolean} enable - Whether the switch button is enabled or not
   *     in default.
   */
  ui.PlayButtonBlock = function(handler, name, description, enable) {
    ui.Block.call(this, 'play-button-block', handler, false);

    var playButton = _createSelector('span', 'ui-icon ui-icon-play');
    playButton.click(this._handlePlayButtonClicked.bind(this));

    var title = _createSelector('div', 'title');

    var titleLeft = _createSelector('div', 'left').html(name);
    titleLeft.click(this.toggleExpand.bind(this));

    var titleRight = _createSelector('div', 'right').append(playButton);

    var body = _createSelector('div', 'body').html(description);

    this.selector.append(title.append(titleLeft, titleRight), body);
    this._addHideableChildren(body);

    this._enable = enable;
  };

  ui.PlayButtonBlock.prototype = {
    /**
     * @returns {Boolean} Whether this play button is currently enabled or not.
     */
    get enable() {
      return this._enable;
    },

    /**
     * Sets whether this play button is currently enabled or not.
     *
     * @param {Boolean} state - True for enabling this block.
     */
    set enable(state) {
      this._enable = state;
    },

    _handlePlayButtonClicked: function() {
      if (this._enable) {
        this._callBackendEventHandler('onPlay');
      }
    }
  };

  utils.setInheritFrom(ui.PlayButtonBlock, ui.Block);

  /**
   * A block ui component for a classic-test execution.
   *
   * It contains related events below:
   *   onStart -- The user click the execution button to start the test.
   *   onStop -- The user click the execution button to stop the test while
   *       the state is currently `ui.ExecutionBlock.STATE.RUNNING`.
   *
   * @constructor
   * @param {Object} handler - A dict of event handlers.
   * @param {String} name - The name of this block.
   * @param {String} description - The description text to show.
   */
  ui.ExecutionBlock = function(handler, name, description) {
    ui.Block.call(this, 'execution-block', handler, false);

    this._bodyDiv = null;
    this._buttonDiv = null;
    this._statusDiv = null;
    this._progressBar = null;

    this._inputs = {};
    this._state = this.STATE.PENDING;

    this._initUI(name, description);
    this._applyStateInfo();
  };

  ui.ExecutionBlock._StateInfo = function(
      buttonCaption, className, handlerName) {
    this.buttonCaption = buttonCaption;
    this.className = className;
    if (handlerName !== undefined) {
      this.handlerName = handlerName;
    }
  };

  /**
   * Enumerates of the states of an execution block.
   */
  ui.ExecutionBlock.STATE = Object.freeze({
    /**
     * Represents that the routine is current not started.
     */
    PENDING: new ui.ExecutionBlock._StateInfo('start', 'state-pending',
                                              'onStart'),

    /**
     * Represents that the routine is starting, and it is immutable now.
     */
    STARTING: new ui.ExecutionBlock._StateInfo('start', 'state-starting'),

    /**
     * Represents that the routine is running, and it is stoppable now.
     */
    RUNNING: new ui.ExecutionBlock._StateInfo('stop', 'state-running',
                                              'onStop'),

    /**
     * Represents that the routine is stopping, and it is immutable now.
     */
    STOPPING: new ui.ExecutionBlock._StateInfo('stop', 'state-stopping')
  });

  ui.ExecutionBlock.prototype = {
    /**
     * This reference allows accessing the enumerate of states by both
     * `ui.ExecutionBlock.STATE` and `someInstanceOfExecutionBlock.STATE`.
     */
    STATE: ui.ExecutionBlock.STATE,

    /**
     * Adds a specified parameter.
     *
     * @param {String} name - Name of the parameter to be removed.
     * @param {ui.Input} input - The input ui component.
     * @param {Number} index - Index of the position to place this new
     *     parameter.
     * @return {ui.ExecutionBlock} `this` object.
     */
    addParameter: function(name, input, index) {
      var nameDiv = _createSelector('div', 'name').text(name);
      var inputDiv = _createSelector('div', 'input').append(input.selector);
      var rowDiv = _createSelector('div', 'input-row');
      this._bodyDiv.insertAt(rowDiv.append(nameDiv, inputDiv), index);
      this._inputs[name] = {instance: input, rowDiv: rowDiv};
    },

    /**
     * Removes a specified parameter.
     *
     * @param {String} name - Name of the parameter to be removed.
     * @return {ui.ExecutionBlock} `this` object.
     */
    removeParameter: function(name) {
      this._inputs[name].instance.destroy();
      this._inputs[name].rowDiv.remove();
      this._inputs[name] = null;

      return this;
    },

    /**
     * Sets the state.
     *
     * @param {ui.ExecutionBlock._StateInfo} state - The new state.
     */
    set state(state) {
      this._buttonDiv.removeClass(this._state.className);
      this._state = state;
      this._applyStateInfo();
    },

    /**
     * @returns {ui.ExecutionBlock._StateInfo} The current state.
     */
    get state() {
      return this._state;
    },

    /**
     * @returns {String} The current status text.
     */
    get status() {
      return this._statusDiv.html();
    },

    /**
     * Sets the status text to show.
     *
     * @param {String} value - The status text to show.
     */
    set status(value) {
      this._statusDiv.html(value);
    },

    /**
     * @returns {Number} The current progress in percentage (0 to 100%)
     *     showed on ui.
     */
    get progressRatio() {
      return this._progressBar.progressbar('option', 'value') / 100;
    },

    /**
     * Sets the progress in percentage to show.
     *
     * @param {Number} value - The progress in between 0 to 1.
     */
    set progressRatio(value) {
      return this._progressBar.progressbar('option', 'value', value * 100);
    },

    _initUI: function(name, description) {
      var title = _createSelector('div', 'title').html(name);
      title.click(this.toggleExpand.bind(this));

      var descrDiv = _createSelector('div', 'description').html(description);

      this._bodyDiv = _createSelector('div', 'body');

      this._buttonDiv = _createSelector('div', 'button');
      this._buttonDiv.click(this._buttonOnClickHandler.bind(this));

      this._statusDiv = _createSelector('div', 'status');

      this._progressBar = _createSelector('div', 'progress-bar').progressbar();

      var nav = _createSelector('div', 'nav');
      var navLeft = _createSelector('div', 'left');

      this.selector.append(title, descrDiv, this._bodyDiv,
                           nav.append(navLeft.append(this._statusDiv,
                                                     this._progressBar),
                                      this._buttonDiv));
      this._addHideableChildren(descrDiv, this._bodyDiv);
    },

    _applyStateInfo: function() {
      this._buttonDiv.addClass(this.state.className);
      this._buttonDiv.text(this.state.buttonCaption);
    },

    _buttonOnClickHandler: function(evt) {
      if (this._state.hasOwnProperty('handlerName')) {
        this._callBackendEventHandler(this._state.handlerName);
      }
    }
  };

  utils.setInheritFrom(ui.ExecutionBlock, ui.Block);

  /**
   * A tab ui component for tabs manager.
   *
   * The only related event handler is `onClose`, which will be called when
   * the user click the close button on the right side of the tab title.
   *
   * @constructor
   * @param {Object} handler - A dict of event handlers.
   * @param {String} name - The name of this tab.
   */
  ui.Tab = function(handler, name) {
    this._id = utils.createUniqueId();

    this._title = _createClassicUISelector('li', 'tab title');
    this._titleLink = _createSelector('a').attr('href', '#' + this._id);

    var closeButton = _createSelector('span', 'ui-icon ui-icon-close');
    closeButton.attr('role', 'presentation');
    closeButton.click(this._callBackendEventHandler.bind(this, 'onClose'));

    this._title.append(this._titleLink, closeButton);

    this._body = _createClassicUISelector('div', 'tab body');
    this._body.attr('id', this._id);

    this._blocks = [];

    ui.Component.call(this, this._title.add(this._body), handler);
    this.name = name;
  };

  ui.Tab.prototype = {
    /**
     * @return {String} The name of this tab.
     */
    get name() {
      return this._titleLink.html();
    },

    /**
     * Sets the name of this tab.
     *
     * @param {String} name - The name of this tab.
     */
    set name(name) {
      return this._titleLink.html(name);
    },

    /**
     * Adds a block.
     *
     * @param {ui.Block} block - The block to be added.
     * @param {Number} index - The index of the new block locate.
     */
    addBlock: function(block, index) {
      this._body.insertAt(block.selector, index);
      this._blocks.splice(index, 0, block);
    },

    /**
     * Removes a block.
     *
     * @param {ui.Block} block - The block to be added.
     */
    removeBlock: function(block) {
      var index = this._blocks.indexOf(block);
      if (index >= 0) {
        block.selector.detach();
        this._blocks.splice(index, 1);
      }
      return this;
    },

    /**
     * @return {jQuery} The tab title selector.
     */
    get titleSelector() {
      return this._title;
    },

    /**
     * @return {jQuery} The tab body selector.
     */
    get bodySelector() {
      return this._body;
    },

    /**
     * Detaches all the blocks and destroys itself.
     */
    destroy: function() {
      for (var i = 0; i < this._blocks; ++i) {
        this._blocks[i].selector.detach();
      }
      this.selector.remove();
    }
  };

  utils.setInheritFrom(ui.Tab, ui.Component);

  /**
   * A tabs manager which contains lot of tab.
   *
   * @constructor
   */
  ui.TabsManager = function() {
    ui.Component.call(
        this, _createClassicUISelector('div', 'tabs-manager body'), {});
    this._titleBar = _createClassicUISelector('ul', 'tabs-manager title');

    this.selector.append(this._titleBar);

    this.selector.tabs({});

    this._tabs = [];
  };

  ui.TabsManager.prototype = {
    /**
     * Adds a tab.
     *
     * @param {ui.Tab} tab - The tab to be added.
     * @return {ui.TabsManager} `this` object.
     */
    addTab: function(tab) {
      this._titleBar.append(tab.titleSelector);
      this.selector.append(tab.bodySelector);

      this.selector.tabs('refresh');
      this.selector.tabs('option',
                         'active', this._titleBar.children().length - 1);

      this._tabs.push(tab);

      return this;
    },

    /**
     * Removes a tab.
     *
     * @param {ui.Tab} tab - The tab to be removed.
     * @return {ui.TabsManager} `this` object.
     */
    removeTab: function(tab) {
      tab.selector.detach();
      this.selector.tabs('refresh');

      var index = this._tabs.indexOf(tab);
      if (index >= 0) {
        this._tabs.splice(index, 0);
      }

      return this;
    },

    /**
     * Detaches all the tabs and then destroys itself.
     */
    destroy: function() {
      for (var i = 0; i < this._tabs.length; ++i) {
        this._tabs[i].detach();
      }
      this.selector.remove();
    }
  };

  utils.setInheritFrom(ui.TabsManager, ui.Component);
})(window);
