define([
    './config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/text!app/templates/Attributes.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    template,
    topic,
    declare,
    lang
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

        setupConnections: function () {
            // summary:
            //      description
            // param or return
            console.info('app/Attributes:setupConnections', arguments);

            this.own(topic.subscribe(config.topics.addAi, lang.hitch(this, 'buildAttributeTable')));
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/Attributes::postCreate', arguments);

            this.inherited(arguments);
            this.setupConnections();
            this.buildAttributeTable({
                graphic: this.graphic,
                aliases: this.aliases
            });
        },
        buildAttributeTable: function (props) {
            // summary:
            //      builds the attribute table
            // props: object containting at a minimum attributes and aliases
            console.info('app/Attributes::buildAttributeTable', arguments);

            domConstruct.empty(this.container);
            var columnSize = 12;
            if (!props.aliases) {
                console.debug('no aliases defined. not showing any attributes');

                return;
            }

            var length = props.aliases.length;
            var size = this.breakpoints[length % columnSize];

            var row;
            props.aliases.forEach(function (item, i) {
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

                if (!props.graphic.attributes[item.field]) {
                    domConstruct.create('div', {
                        className: 'text-danger glyphicon glyphicon-minus',
                        style: 'display:block'
                    }, heading, 'after');

                    return;
                }
                var p = domConstruct.create('div', {
                    className: 'text-muted'
                }, heading, 'after');

                p.innerHTML = props.graphic.attributes[item.field];
            }, this);
        }
    });
});
