(function(exports) {
  'use strict';

  exports.classic = exports.classic || {};
  exports.classic.utils = exports.classic.utils || {};

  var utils = exports.classic.utils;

  /**
   * Returns an unique string each time it is called.
   *
   * @param {string=} prefix - The prefix of the returned string (default
   *     value is "id").
   * @returns A string which never equals to strings returned in other time.
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
   * @param {Object} child - The class to become child.
   * @param {Object} parent - The class to become parent.
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

  /**
   * Prints log information about an unimplemented function being called.
   */
  utils.notifyUnimplemented = function() {
    console.log('[waring] An unimplemented function/method was called');
  };

  /**
   * Converts an arguments object to an array.
   *
   * @param {Object} args - An arguments object.
   * @param {Number} begin - Zero-based index at which to begin extraction.
   * @param {Number=} end - Zero-base index at which to end (not including)
   *     extraction.  The default value is `args.length`.
   * @returns An array.
   */
  utils.argsObjToArray = function(args, begin, end) {
    return Array.prototype.slice.call(args, begin, end);
  };
})(window);
