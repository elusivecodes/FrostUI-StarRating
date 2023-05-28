(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@fr0st/ui'), require('@fr0st/query')) :
    typeof define === 'function' && define.amd ? define(['exports', '@fr0st/ui', '@fr0st/query'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.UI = global.UI || {}, global.UI, global.fQuery));
})(this, (function (exports, ui, $) { 'use strict';

    /**
     * StarRating Class
     * @class
     */
    class StarRating extends ui.BaseComponent {
        /**
         * New StarRating constructor.
         * @param {HTMLElement} node The input node.
         * @param {object} [options] The options to create the StarRating with.
         */
        constructor(node, options) {
            super(node, options);

            if (this._options.step) {
                this._stepLength = `${this._options.step}`.replace('\d*\.?/', '').length;
            }

            if ($.hasAttribute(this._node, 'step')) {
                this._options.step = $.getAttribute(this._node, 'step');
            }

            if ($.hasAttribute(this._node, 'min')) {
                this._options.min = $.getAttribute(this._node, 'min');
            }

            if ($.hasAttribute(this._node, 'max')) {
                this._options.max = $.getAttribute(this._node, 'max');
            }

            if (this._options.max === null) {
                this._options.max = this._options.stars;
            }

            if ($.is(this._node, '[readonly]')) {
                this._options.displayOnly = true;
            }

            this._render();
            this._refresh();

            if (!this._options.displayOnly) {
                this._events();
            }

            if (this._options.tooltip) {
                this._tooltipEvents();
            }

            this._refreshDisabled();
        }

        /**
         * Disable the StarRating.
         */
        disable() {
            $.setAttribute(this._node, { disabled: true });
            this._refreshDisabled();
        }

        /**
         * Dispose the StarRating.
         */
        dispose() {
            if (this._tooltip) {
                this._tooltip.dispose();
                this._tooltip = null;
            }

            $.remove(this._outerContainer);
            $.removeAttribute(this._node, 'tabindex');
            $.removeEvent(this._node, 'focus.ui.starrating');
            $.removeClass(this._node, this.constructor.classes.hide);

            this._outerContainer = null;
            this._container = null;
            this._filledContainer = null;

            super.dispose();
        }

        /**
         * Enable the StarRating.
         */
        enable() {
            $.removeAttribute(this._node, 'disabled');
            this._refreshDisabled();
        }

        /**
         * Get the current value.
         * @return {number} The current value.
         */
        getValue() {
            const value = $.getValue(this._node);

            return value !== '' ?
                parseFloat(value) :
                null;
        }

        /**
         * Set the current value.
         * @param {number} value The value to set.
         */
        setValue(value) {
            value = parseFloat(value);
            value = this._clampValue(value);

            if (value === this.getValue()) {
                return;
            }

            const percent = this._getPercent(value);

            $.setStyle(this._filledContainer, { width: `${percent}%` });

            this._setTooltipText(value);

            $.setValue(this._node, value);
            $.triggerEvent(this._node, 'change.ui.starrating');
        }
    }

    /**
     * Attach events for the StarRating.
     */
    function _events() {
        $.addEvent(this._node, 'focus.ui.starrating', (_) => {
            $.focus(this._container);
        });

        $.addEvent(this._container, 'click.ui.starrating', (e) => {
            const percentX = $.percentX(this._container, e.pageX, { offset: true });
            const value = this._getValue(percentX);

            this.setValue(value);
        });

        $.addEvent(this._container, 'mousemove.ui.starrating', $.debounce((e) => {
            const percentX = $.percentX(this._container, e.pageX, { offset: true });
            const value = this._getValue(percentX);
            const percent = this._getPercent(value);

            if (this._options.animate) {
                $.setStyle(this._filledContainer, { transition: 'none' });
            }

            $.setStyle(this._filledContainer, { width: `${percent}%` });

            if (this._options.animate) {
                // force redraw
                $.rect(this._filledContainer);
                $.setStyle(this._filledContainer, { transition: '' });
            }

            this._setTooltipText(value);
        }), { passive: true });

        $.addEvent(this._container, 'mouseleave.ui.starrating', (_) => {
            this._refresh();
        });

        $.addEvent(this._container, 'keydown.ui.starrating', (e) => {
            let value = this.getValue();

            if (value === null) {
                value = this._options.min;
            }

            switch (e.code) {
                case 'ArrowLeft':
                    value = Math.max(this._options.min, value - this._options.step);
                    break;
                case 'ArrowRight':
                    value = Math.min(this._options.max, value + this._options.step);
                    break;
                default:
                    return;
            }

            this.setValue(value);
        });
    }
    /**
     * Attach events for the StarRating tooltip.
     */
    function _tooltipEvents() {
        $.addEvent(this._container, 'mouseenter.ui.starrating', (_) => {
            this._tooltip._stop();
            this._tooltip.show();
        });

        $.addEvent(this._container, 'mouseleave.ui.starrating', (_) => {
            this._tooltip._stop();
            this._tooltip.hide();
        });
    }

    /**
     * Clamp a value to a step-size, and between a min and max value.
     * @param {number} value The value to clamp.
     * @returns The clamped value.
     */
    function _clampValue(value) {
        if (this._options.step) {
            value /= this._options.step;
            value = value < 1 ? Math.round(value) : Math.ceil(value);
            value *= this._options.step;
            value = value.toFixed(this._stepLength);
        }

        return $._clamp(value, this._options.min, this._options.max);
    }
    /**
     * Get the percent from a value.
     * @param {number} value The value.
     * @return {number} The percent.
     */
    function _getPercent(value) {
        return $._inverseLerp(0, this._options.stars, value) * 100;
    }
    /**
     * Get the value from an X percent.
     * @param {number} percentX The X percent.
     * @return {number} The value.
     */
    function _getValue(percentX) {
        const value = $._lerp(0, this._options.stars, percentX / 100);

        return this._clampValue(value);
    }
    /**
     * Refresh the star rating.
     */
    function _refresh() {
        const value = this.getValue();
        const percent = this._getPercent(value);

        $.setStyle(this._filledContainer, { width: `${percent}%` });

        this._setTooltipText(value);
    }
    /**
     * Refresh the disabled styling.
     */
    function _refreshDisabled() {
        if ($.is(this._node, ':disabled')) {
            $.addClass(this._container, this.constructor.classes.disabled);
        } else {
            $.removeClass(this._container, this.constructor.classes.disabled);
        }
    }
    /**
     * Set the tooltip text.
     * @param {number} value The value.
     */
    function _setTooltipText(value) {
        if (!this._tooltip) {
            return;
        }

        if (value === null) {
            value = this._options.min;
        }

        const ratingText = this._options.tooltipText.bind(this)(value);
        $.setDataset(this._container, { uiTitle: ratingText });

        this._tooltip.refresh();
        this._tooltip.update();
    }

    /**
     * Render the star rating.
     */
    function _render() {
        this._outerContainer = $.create('div');

        if (this._options.animate) {
            $.addClass(this._outerContainer, this.constructor.classes.animate);
        }

        this._container = $.create('div', {
            class: [this.constructor.classes.container, `starrating-${this._options.size}`],
            attributes: {
                tabindex: 0,
            },
        });

        const outline = [];
        const filled = [];
        for (let i = 0; i < this._options.stars; i++) {
            outline.push(this.constructor.icons.outline);
            filled.push(this.constructor.icons.filled);
        }

        const outlineContainer = $.create('div', {
            class: this.constructor.classes.outline,
            html: outline.join(''),
        });

        this._filledContainer = $.create('div', {
            class: this.constructor.classes.filled,
            html: filled.join(''),
        });

        $.append(this._container, outlineContainer);
        $.append(this._container, this._filledContainer);
        $.append(this._outerContainer, this._container);

        // hide the input node
        $.addClass(this._node, this.constructor.classes.hide);
        $.setAttribute(this._node, { tabindex: -1 });

        $.before(this._node, this._outerContainer);

        if (this._options.tooltip) {
            this._tooltip = ui.Tooltip.init(this._container, {
                appendTo: 'body',
                trigger: '',
                placement: 'top',
            });
        }
    }

    // StarRating default options
    StarRating.defaults = {
        size: 'md',
        min: 0,
        max: null,
        step: 1,
        stars: 5,
        tooltip: true,
        tooltipText: (rating) => rating === 1 ?
            `${rating} star` :
            `${rating} stars`,
        animate: true,
        displayOnly: false,
    };

    // StarRating classes
    StarRating.classes = {
        animate: 'starrating-animate',
        container: 'starrating',
        disabled: 'starrating-disabled',
        filled: 'starrating-filled',
        hide: 'visually-hidden',
        outline: 'starrating-outline',
    };

    // StarRating icons
    StarRating.icons = {
        filled: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27z" fill="currentColor"/></svg>',
        outline: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 15.39l-3.76 2.27l.99-4.28l-3.32-2.88l4.38-.37L12 6.09l1.71 4.04l4.38.37l-3.32 2.88l.99 4.28M22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.45 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24z" fill="currentColor"/></svg>',
    };

    // StarRating prototype
    const proto = StarRating.prototype;

    proto._clampValue = _clampValue;
    proto._events = _events;
    proto._getPercent = _getPercent;
    proto._getValue = _getValue;
    proto._refresh = _refresh;
    proto._refreshDisabled = _refreshDisabled;
    proto._render = _render;
    proto._tooltipEvents = _tooltipEvents;
    proto._setTooltipText = _setTooltipText;

    // StarRating init
    ui.initComponent('starrating', StarRating);

    exports.StarRating = StarRating;

}));
//# sourceMappingURL=frost-ui-starrating.js.map
