define([
    './GridFilter',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!./templates/GridFooter.html',
    'dojo/_base/declare'
], function (
    GridFilter,

    _TemplatedMixin,
    _WidgetBase,

    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Container for grid footer
        templateString: template,
        baseClass: 'grid-footer',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/GridFooter:postCreate', arguments);

            this.childWidgets = [];

            this.childWidgets.push(new GridFilter({
                grid: this.parent.grid,
                store: this.parent.store
            }).placeAt(this.containerLeft, 'first'));
            this.inherited(arguments);
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.info('app/GridFooter:startup', arguments);

            this.childWidgets.forEach(function (widget) {
                console.info(widget.declaredClass);
                this.own(widget);
                widget.startup();
            }, this);

            this.inherited(arguments);
        }
    });
});
