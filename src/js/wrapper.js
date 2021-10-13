/**
 * FrostUI-StarRating v1.0
 * https://github.com/elusivecodes/FrostUI-StarRating
 */
(function(global, factory) {
    'use strict';

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory;
    } else {
        factory(global);
    }

})(window, function(window) {
    'use strict';

    if (!window) {
        throw new Error('FrostUI-StarRating requires a Window.');
    }

    if (!('UI' in window)) {
        throw new Error('FrostUI-StarRating requires FrostUI.');
    }

    const Core = window.Core;
    const DOM = window.DOM;
    const dom = window.dom;
    const UI = window.UI;

    // {{code}}
});