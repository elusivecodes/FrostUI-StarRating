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
