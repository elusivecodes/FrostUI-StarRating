import $ from '@fr0st/query';
import { getPosition } from '@fr0st/ui';

/**
 * Attach events for the StarRating.
 */
export function _events() {
    $.addEvent(this._node, 'focus.ui.starrating', (_) => {
        $.focus(this._container);
    });

    const downEvent = (e) => {
        if (
            e.button ||
            $.is(this._node, ':disabled')
        ) {
            return false;
        }

        $.setStyle(this._filledContainer, { transition: 'none' });

        const pos = getPosition(e);
        const percentX = $.percentX(this._container, pos.x, { offset: true });
        const value = this._getValue(percentX);

        this.setValue(value);

        $.setDataset(this._container, { uiDragging: true });

        if (this._options.tooltip && !$.getDataset(this._container, 'uiHover')) {
            this._tooltip._stop();
            this._tooltip.show();
        }
    };

    const moveEvent = (e) => {
        const pos = getPosition(e);
        const percentX = $.percentX(this._container, pos.x, { offset: true });
        const value = this._getValue(percentX);

        this.setValue(value);
    };

    const upEvent = (e) => {
        $.removeDataset(this._container, 'uiDragging');

        if (this._options.tooltip && !$.getDataset(this._container, 'uiHover')) {
            this._tooltip._stop();
            this._tooltip.hide();
        }

        const pos = getPosition(e);
        const percentX = $.percentX(this._container, pos.x, { offset: true });
        const value = this._getValue(percentX);

        if (value === this.getValue()) {
            this._updateValue(value);
        } else {
            this.setValue(value);
        }

        // force redraw
        $.rect(this._filledContainer);
        $.setStyle(this._filledContainer, { transition: '' });
    };

    const dragEvent = $.mouseDragFactory(downEvent, moveEvent, upEvent);

    $.addEvent(this._container, 'mousedown.ui.starrating touchstart.ui.starrating', dragEvent);

    $.addEvent(this._container, 'keydown.ui.starrating', (e) => {
        let value = this.getValue();

        if (value === null) {
            value = this._options.min;
        }

        switch (e.code) {
            case 'ArrowLeft':
            case 'ArrowDown':
                value -= this._options.step;
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                value += this._options.step;
                break;
            case 'End':
                value = this._options.max;
                break;
            case 'Home':
                value = this._options.min;
                break;
            case 'PageDown':
                value--;
                break;
            case 'PageUp':
                value++;
                break;
            default:
                return;
        }

        this.setValue(value);
    });

    if (this._options.hover) {
        this._hoverEvents();
    }
};

/**
 * Attach hover events for the StarRating.
 */
export function _hoverEvents() {
    $.addEvent(this._container, 'mousemove.ui.starrating', $.debounce((e) => {
        if (
            $.is(this._node, ':disabled') ||
            $.getDataset(this._container, 'uiDragging')
        ) {
            return;
        }

        const percentX = $.percentX(this._container, e.pageX, { offset: true });
        const value = this._getValue(percentX);

        const percent = this._getPercent(value);

        $.setStyle(this._filledContainer, { transition: 'none' });
        $.setStyle(this._filledContainer, { width: `${percent}%` });

        // force redraw
        $.rect(this._filledContainer);
        $.setStyle(this._filledContainer, { transition: '' });

        this._updateValue(value, { updateAria: false });
    }), { passive: true });

    $.addEvent(this._container, 'mouseleave.ui.starrating', (_) => {
        if (
            $.is(this._node, ':disabled') ||
            $.getDataset(this._container, 'uiDragging')
        ) {
            return;
        }

        this._refresh();
    });
};

/**
 * Attach events for the StarRating tooltip.
 */
export function _tooltipEvents() {
    $.addEvent(this._container, 'mouseenter.ui.starrating', (e) => {
        if (!$.isSame(e.target, this._container)) {
            return;
        }

        if (!$.getDataset(this._container, 'uiDragging')) {
            this._tooltip._stop();
            this._tooltip.show();
        }

        $.setDataset(this._container, { uiHover: true });
    });

    $.addEvent(this._container, 'mouseleave.ui.starrating', (e) => {
        if (!$.isSame(e.target, this._container)) {
            return;
        }

        if (!$.getDataset(this._container, 'uiDragging')) {
            this._tooltip._stop();
            this._tooltip.hide();
        }

        $.removeDataset(this._container, 'uiHover');
    });
};
