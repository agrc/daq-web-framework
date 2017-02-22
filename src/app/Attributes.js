define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/text!app/templates/Attributes.html',
    'dojo/_base/declare'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      show the attributes
        templateString: template,
        baseClass: 'attributes',
        columns: 12,
        breakpoints: {
            0: 4,
            1: 4,
            2: 6,
            3: 4,
            4: 3,
            5: 4,
            6: 4,
            7: 3,
            8: 3,
            9: 4,
            10: 4,
            11: 3
        },
        ignoreAttributes: ['Shape_Leng', 'Shape_Area', 'GlobalID', 'FID', 'OBJECTID'],

        // Properties to be sent into constructor
        attributes: null,

        aliases: null,


        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.Attributes::postCreate', arguments);

            this.inherited(arguments);
            // this.ignoreAttributes.forEach(function (key) {
            //     delete this.attributes[key];
            // }, this);

            var columnSize = 12;
            var length = Object.keys(this.aliases).length;
            var size = this.breakpoints[length % columnSize];

            var row;
            this.aliases.forEach(function (item, i) {
                if (i * size % this.columns === 0) {
                    row = domConstruct.create('div', {
                        className: 'row'
                    }, this.container, 'last');
                }
                var cell = domConstruct.create('div', {
                    className: 'form-group col-xs-6 col-sm-' + size + ' col-md-' + size
                }, row);

                var heading = domConstruct.create('label', {}, cell, 'first');
                heading.innerHTML = item.alias;

                if (!this.attributes[item.field]) {
                    domConstruct.create('div', {
                        className: 'text-danger glyphicon glyphicon-minus',
                        style: 'display:block'
                    }, heading, 'after');

                    return;
                }
                var p = domConstruct.create('div', {
                    className: 'text-muted'
                }, heading, 'after');

                p.innerHTML = this.attributes[item.field];
            }, this);
        }
    });
});
