define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!app/templates/GridFilter.html',

    'dstore/Filter'
], function (
    _TemplatedMixin,
    _WidgetBase,

    declare,
    template,

    Filter
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      filter items in the grid
        templateString: template,
        baseClass: 'grid-filter',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/GridFilter:postCreate', arguments);

            // this.setupConnections();

            this.inherited(arguments);
        },
        // setupConnections: function () {
        //     // summary:
        //     //      wire events, and such
        //     console.info('app/GridFilter:setupConnections', arguments);
        //
        // },
        filterGrid: function (evt) {
            // summary:
            //      description
            // param or return
            console.info('app/GridFilter:filterGrid', arguments);

            var filter = new Filter();
            filter = filter.match('title', new RegExp(evt.target.value, 'i'));

            if (evt.target.value === '') {
                filter = {};
            }

            this.grid.set('collection', this.store.filter(filter));
        }
    });
});
