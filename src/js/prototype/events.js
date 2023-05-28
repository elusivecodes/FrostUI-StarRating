import $ from '@fr0st/query';

/**
 * Attach events for the StarRating.
 */
export function _events() {
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
};

/**
 * Attach events for the StarRating tooltip.
 */
export function _tooltipEvents() {
    $.addEvent(this._container, 'mouseenter.ui.starrating', (_) => {
        this._tooltip._stop();
        this._tooltip.show();
    });

    $.addEvent(this._container, 'mouseleave.ui.starrating', (_) => {
        this._tooltip._stop();
        this._tooltip.hide();
    });
};
