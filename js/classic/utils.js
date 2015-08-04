(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.utils = exports.classic.utils || {};

  var utils = exports.classic.utils;

  /**
   * Returns an unique string each time it is called.
   *
   * @param prefix (optional) the prefix of the returned string.
   * @return A string which will never equal to strings returned in other time.
   */
  utils.createUniqueId = (function() {
    var counter = {};
    return function(prefix) {
      if (prefix === undefined) {
        prefix = 'id';
      }
      if (!counter.hasOwnProperty(prefix)) {
        counter[prefix] = 0;
      }
      return prefix + (++counter[prefix]);
    };
  })();

  /**
   * Lets a class inherit from a gived parent class.
   *
   * This is implemented by creating the prototype chain.
   *
   * @param child the class to become child.
   * @param parent the class to become parent.
   */
  utils.setInheritFrom = (function() {
    var setPrototypeOf = Object.setPrototypeOf;
    if (!(Object.setPrototypeOf instanceof Function)) {
      setPrototypeOf = function(obj, proto) {
        obj.__proto__ = proto;
        return obj;
      };
    }
    return function(child, parent) {
      setPrototypeOf(child.prototype, parent.prototype);
      child.prototype.constructor = parent;
    };
  })();

  utils.notifyUnimplemented = function() {
    console.log('[waring] An unimplemented function/method was called');
  };
})(window);
