import $ from '@fr0st/query';

/**
 * Clamp a value to a step-size, and between a min and max value.
 * @param {number} value The value to clamp.
 * @return {number} The clamped value.
 */
export function _clampValue(value) {
    if (this._options.step) {
        value /= this._options.step;
        value = value < 1 ? Math.round(value) : Math.ceil(value);
        value *= this._options.step;
        value = value.toFixed(this._stepLength);
    }

    return $._clamp(value, this._options.min, this._options.max);
};

/**
 * Get the percent from a value.
 * @param {number} value The value.
 * @return {number} The percent.
 */
export function _getPercent(value) {
    return $._inverseLerp(0, this._options.stars, value) * 100;
};

/**
 * Get the value from an X percent.
 * @param {number} percentX The X percent.
 * @return {number} The value.
 */
export function _getValue(percentX) {
    const value = $._lerp(0, this._options.stars, percentX / 100);

    return this._clampValue(value);
};

/**
 * Refresh the star rating.
 */
export function _refresh() {
    const value = this.getValue();
    const percent = this._getPercent(value);

    $.setStyle(this._filledContainer, { width: `${percent}%` });

    this._updateValue(value);
};

/**
 * Refresh the disabled styling.
 */
export function _refreshDisabled() {
    const disabled = $.is(this._node, ':disabled');

    if (disabled) {
        $.addClass(this._container, this.constructor.classes.disabled);
    } else {
        $.removeClass(this._container, this.constructor.classes.disabled);
    }

    $.setAttribute(this._container, {
        'aria-disabled': disabled,
        'tabindex': disabled ? -1 : 0,
    });
};

/**
 * Update the value.
 * @param {number} value The value.
 * @param {object} [options] The options for updating the value.
 */
export function _updateValue(value, { updateAria = true, updateTooltip = true } = {}) {
    if (value === null) {
        value = this._options.min;
    }

    const ratingText = this._options.ratingText.bind(this)(value);

    if (updateAria) {
        $.setAttribute(this._container, {
            'aria-valuenow': value,
            'aria-valuetext': ratingText,
        });
    }

    if (updateTooltip && this._tooltip) {
        $.setDataset(this._container, { uiTitle: ratingText });

        this._tooltip.refresh();
        this._tooltip.update();
    }
};
