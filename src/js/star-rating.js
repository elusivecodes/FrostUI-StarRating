import $ from '@fr0st/query';
import { BaseComponent, generateId } from '@fr0st/ui';

/**
 * StarRating Class
 * @class
 */
export default class StarRating extends BaseComponent {
    /**
     * New StarRating constructor.
     * @param {HTMLElement} node The input node.
     * @param {object} [options] The options to create the StarRating with.
     */
    constructor(node, options) {
        super(node, options);

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

        if ($.getProperty(this._node, 'readOnly')) {
            this._options.displayOnly = true;
        }

        if (this._options.step) {
            this._stepLength = `${this._options.step}`.replace('\d*\.?/', '').length;
        }

        const id = $.getAttribute(this._node, 'id');
        this._label = $.findOne(`label[for="${id}"]`);

        if (this._label && !$.getAttribute(this._label, 'id')) {
            $.setAttribute(this._label, { id: generateId('starrating-label') });
            this._labelId = true;
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
        if (this._labelId) {
            $.removeAttribute(this._label, 'id');
        }

        if (this._tooltip) {
            this._tooltip.dispose();
            this._tooltip = null;
        }

        $.remove(this._outerContainer);
        $.removeAttribute(this._node, 'tabindex');
        $.removeEvent(this._node, 'focus.ui.starrating');
        $.removeClass(this._node, this.constructor.classes.hide);

        this._label = null;
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

        this._updateValue(value);

        $.setValue(this._node, value);
        $.triggerEvent(this._node, 'change.ui.starrating');
    }
}
