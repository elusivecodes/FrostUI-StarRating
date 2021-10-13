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
