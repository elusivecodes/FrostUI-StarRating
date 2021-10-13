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

    /**
     * StarRating Class
     * @class
     */
    class StarRating extends UI.BaseComponent {

        /**
         * New StarRating constructor.
         * @param {HTMLElement} node The input node.
         * @param {object} [settings] The options to create the StarRating with.
         * @returns {StarRating} A new StarRating object.
         */
        constructor(node, settings) {
            super(node, settings);

            if (this._settings.step) {
                this._stepLength = `${this._settings.step}`.replace('\d*\.?/', '').length;
            }

            if (dom.hasAttribute(this._node, 'step')) {
                this._settings.step = dom.getAttribute(this._node, 'step');
            }

            if (dom.hasAttribute(this._node, 'min')) {
                this._settings.min = dom.getAttribute(this._node, 'min');
            }

            if (dom.hasAttribute(this._node, 'max')) {
                this._settings.max = dom.getAttribute(this._node, 'max');
            }

            if (this._settings.max === null) {
                this._settings.max = this._settings.stars;
            }

            if (dom.is(this._node, '[readonly]')) {
                this._settings.displayOnly = true;
            }

            this._render();
            this._refresh();

            if (!this._settings.displayOnly) {
                this._events();
            }

            if (this._settings.tooltip) {
                this._tooltipEvents();
            }

            this._refreshDisabled();
        }

        /**
         * Disable the StarRating.
         * @returns {StarRating} The StarRating.
         */
        disable() {
            dom.setAttribute(this._node, 'disabled', true);
            this._refreshDisabled();

            return this;
        }

        /**
         * Dispose the StarRating.
         */
        dispose() {
            if (this._tooltip) {
                this._tooltip.dispose();
                this._tooltip = null;
            }

            dom.remove(this._outerContainer);
            dom.removeAttribute(this._node, 'tabindex');
            dom.removeEvent(this._node, 'focus.ui.slider');
            dom.removeClass(this._node, this.constructor.classes.hide);

            this._outerContainer = null;
            this._container = null;
            this._filledContainer = null;

            super.dispose();
        }

        /**
         * Enable the StarRating.
         * @returns {StarRating} The StarRating.
         */
        enable() {
            dom.removeAttribute(this._node, 'disabled');
            this._refreshDisabled();

            return this;
        }

        /**
         * Get the current value.
         * @returns {number} The current value.
         */
        getValue() {
            const value = dom.getValue(this._node);

            return value ?
                parseFloat(value) :
                null;
        }

        /**
         * Set the current value.
         * @param {number} value The value to set.
         * @returns {StarRating} The StarRating.
         */
        setValue(value) {
            value = parseFloat(value);

            if (value === this.getValue()) {
                return;
            }

            dom.setValue(this._node, value);
            this._refresh();

            dom.triggerEvent(this._node, 'change.ui.starrating');

            return this;
        }

    }


    /**
     * StarRating Events
     */

    Object.assign(StarRating.prototype, {

        /**
         * Attach events for the StarRating.
         */
        _events() {
            dom.addEvent(this._node, 'focus.ui.slider', _ => {
                dom.focus(this._container);
            });

            dom.addEvent(this._container, 'click.ui.starrating', e => {
                const percentX = dom.percentX(this._container, e.pageX, true);
                const value = this._getValue(percentX);

                this.setValue(value);
            });

            dom.addEvent(this._container, 'mousemove.ui.starrating', DOM.debounce(e => {
                const percentX = dom.percentX(this._container, e.pageX, true);
                const value = this._getValue(percentX);
                const percent = this._getPercent(value);
                dom.setStyle(this._filledContainer, 'width', `${percent}%`);
                this._setTooltipText(value);
            }));

            dom.addEvent(this._container, 'mouseleave.ui.starrating', _ => {
                this._refresh();
            });

            dom.addEvent(this._container, 'keydown.ui.starrating', e => {
                let value = this.getValue();

                if (value === null) {
                    value = this._settings.min;
                }

                switch (e.code) {
                    case 'ArrowLeft':
                        value = Math.max(this._settings.min, value - this._settings.step);
                        break;
                    case 'ArrowRight':
                        value = Math.min(this._settings.max, value + this._settings.step);
                        break;
                    default:
                        return;
                }

                this.setValue(value);
            });
        },

        _tooltipEvents() {
            dom.addEvent(this._container, 'mouseenter.ui.starrating', _ => {
                this._tooltip._stop();
                this._tooltip.show();
            });

            dom.addEvent(this._container, 'mouseleave.ui.starrating', _ => {
                this._tooltip._stop();
                this._tooltip.hide();
            });
        }

    });


    /**
     * StarRating Helpers
     */

    Object.assign(StarRating.prototype, {

        /**
         * Get the percent from a value.
         * @param {number} value The value.
         * @returns {number} The percent.
         */
        _getPercent(value) {
            return Core.inverseLerp(0, this._settings.stars, value) * 100;
        },

        /**
         * Get the value from an X percent.
         * @param {number} percentX The X percent.
         * @returns {number} The value.
         */
        _getValue(percentX) {
            let value = Core.lerp(0, this._settings.stars, percentX / 100);

            if (this._settings.step) {
                value /= this._settings.step;
                value = value < 1 ? Math.round(value) : Math.ceil(value);
                value *= this._settings.step;
                value = value.toFixed(this._stepLength);
            }

            return Core.clamp(value, this._settings.min, this._settings.max);
        },

        /**
         * Refresh the disabled styling.
         */
        _refreshDisabled() {
            if (dom.is(this._node, ':disabled')) {
                dom.addClass(this._container, this.constructor.classes.disabled);
            } else {
                dom.removeClass(this._container, this.constructor.classes.disabled);
            }
        },

        /**
         * Set the tooltip text.
         * @param {number} value The value.
         */
        _setTooltipText(value) {
            if (!this._tooltip) {
                return;
            }

            if (value === null) {
                value = this._settings.min;
            }

            const ratingText = this._settings.tooltipText.bind(this)(value);
            dom.setDataset(this._container, 'uiTitle', ratingText);

            this._tooltip.refresh();
            this._tooltip.update();
        }

    });


    /**
     * StarRating Render
     */

    Object.assign(StarRating.prototype, {

        /**
         * Refresh the star rating.
         */
        _refresh() {
            const value = this.getValue();
            const percent = this._getPercent(value);
            dom.setStyle(this._filledContainer, 'width', `${percent}%`);
            this._setTooltipText(value);
        },

        /**
         * Render the star rating.
         */
        _render() {
            this._outerContainer = dom.create('div');

            if (this._settings.animate) {
                dom.addClass(this._outerContainer, this.constructor.classes.animate);
            }

            this._container = dom.create('div', {
                class: [this.constructor.classes.container, `starrating-${this._settings.size}`],
                attributes: {
                    tabindex: 0
                }
            });

            const outline = [];
            const filled = [];
            for (let i = 0; i < this._settings.stars; i++) {
                outline.push(this.constructor.icons.outline);
                filled.push(this.constructor.icons.filled);
            }

            const outlineContainer = dom.create('div', {
                class: this.constructor.classes.outline,
                html: outline.join('')
            });

            this._filledContainer = dom.create('div', {
                class: this.constructor.classes.filled,
                html: filled.join('')
            });

            dom.append(this._container, outlineContainer);
            dom.append(this._container, this._filledContainer);
            dom.append(this._outerContainer, this._container);

            // hide the input node
            dom.addClass(this._node, this.constructor.classes.hide);
            dom.setAttribute(this._node, 'tabindex', '-1');

            dom.before(this._node, this._outerContainer);

            if (this._settings.tooltip) {
                this._tooltip = UI.Tooltip.init(this._container, {
                    appendTo: 'body',
                    trigger: '',
                    placement: 'top'
                });
            }
        }

    });


    // StarRating default options
    StarRating.defaults = {
        size: 'md',
        min: 0,
        max: null,
        step: 1,
        stars: 5,
        tooltip: true,
        tooltipText: rating => rating === 1 ?
            `${rating} star` :
            `${rating} stars`,
        animate: true,
        displayOnly: false
    };

    // Default classes
    StarRating.classes = {
        animate: 'starrating-animate',
        container: 'position-relative d-inline-block overflow-hidden lh-1 text-nowrap starrating',
        disabled: 'starrating-disabled',
        filled: 'position-absolute top-0 overflow-hidden starrating-filled',
        hide: 'visually-hidden',
        outline: 'starrating-outline'
    };

    // Default icons
    StarRating.icons = {
        filled: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2L9.19 8.62L2 9.24l5.45 4.73L5.82 21L12 17.27z" fill="currentColor"/></svg>',
        outline: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 15.39l-3.76 2.27l.99-4.28l-3.32-2.88l4.38-.37L12 6.09l1.71 4.04l4.38.37l-3.32 2.88l.99 4.28M22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.45 4.73L5.82 21L12 17.27L18.18 21l-1.64-7.03L22 9.24z" fill="currentColor"/></svg>'
    };

    UI.initComponent('starrating', StarRating);

    UI.StarRating = StarRating;

});