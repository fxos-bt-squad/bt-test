/* global $ */

(function(exports) {
  'use strict';

  /**
   * Inserts an element before i-th child of the selector.
   * If the gived index is larger than or equal to the number of
   * children in the selector, it will append the gived element at the
   * end.  And if the gived index is less than zero, the behavior will
   * equals to the one which index is zero.
   *
   * @param child The element to add.
   * @param index The place of the new element.
   * @return this
   */
  $.fn.insertAt = function(child, index) {
    index = Math.max(0, index);
    if (this.children().length <= index) {
      this.append(child);
    } else {
      $(this.children()[index]).before(child);
    }
    return this;
  };
})(window);
