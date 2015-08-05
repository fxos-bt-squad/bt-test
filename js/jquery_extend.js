/* global $ */

(function(exports) {
  'use strict';

  /**
   * Inserts an element before i-th child of the selector.
   * If the gived index is larger than or equal to the number of
   * children in the selector, it will append the gived element at the
   * end.  And a negative index indicates an offset from the end of the
   * sequence.
   *
   * @param {jQuery} child - The element to add.
   * @param {Number} index - The place of the new element.
   * @returns {Object} `this` object.
   */
  $.fn.insertAt = function(child, index) {
    if (this.children().length === 0 || this.children().length <= index) {
      this.append(child);
    } else {
      if (index < 0) {
        index = Math.max(this.children().length + index, 0);
      }
      $(this.children()[index]).before(child);
    }
    return this;
  };
})(window);
