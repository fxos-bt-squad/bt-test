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
})(window);
