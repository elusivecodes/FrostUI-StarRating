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
