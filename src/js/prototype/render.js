import $ from '@fr0st/query';
import { Tooltip } from '@fr0st/ui';

/**
 * Render the star rating.
 */
export function _render() {
    this._outerContainer = $.create('div');

    if (this._options.animate) {
        $.addClass(this._outerContainer, this.constructor.classes.animate);
    }

    this._container = $.create('div', {
        class: [this.constructor.classes.container, `starrating-${this._options.size}`],
        attributes: {
            'role': 'slider',
            'aria-valuemin': this._options.min,
            'aria-valuemax': this._options.max,
            'aria-valuenow': '',
            'aria-valuetext': '',
            'aria-required': $.getProperty(this._node, 'required'),
        },
    });

    if (this._label) {
        const labelId = $.getAttribute(this._label, 'id');
        $.setAttribute(this._container, { 'aria-labelledby': labelId });
    }

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
        this._tooltip = Tooltip.init(this._container, {
            appendTo: 'body',
            trigger: '',
            placement: 'top',
        });
    }
};
