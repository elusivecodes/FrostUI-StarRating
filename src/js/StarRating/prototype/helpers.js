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
