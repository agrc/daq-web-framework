define([
    'app/config',
    'app/GraphicsController',
    'app/MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/keys',
    'dojo/on',
    'dojo/text!app/templates/Query.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/tasks/query'
], function (
    config,
    GraphicsController,
    MapController,

    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    keys,
    on,
    template,
    topic,
    declare,
    lang,

    Query
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      canned queries
        templateString: template,
        baseClass: 'query panel-body',

        cannedQueries: {
            ai: config.fields.lock + '={query}',
            company: 'UPPER(' + config.fields.queryOne + ') LIKE UPPER(\'%{query}%\')'
        },

        // Properties to be sent into constructor

        // esri/layers that support query
        layers: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.Query::postCreate', arguments);

            this.setupConnections();

            this.layers.forEach(function (layer) {
                this.layer.appendChild(domConstruct.toDom('<option value="' +
                    layer.layerId + '">' + layer.name + '</option>'));
            }, this);

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app.Query::setupConnections', arguments);

            on(this.input, 'keyup', lang.hitch(this, '_submitOnEnter'));
        },
        query: function () {
            // summary:
            //      description
            // param or return
            console.log('module.id:query', arguments);

            var activeLayer = this.layers[this.layer.value];

            var query = new Query();
            query.where = lang.replace(this.cannedQueries[this.type.value], {
                query: this.input.value
            });
            query.outFields = ['SHAPE'];

            activeLayer.queryFeatures(query).then(
                function (featureSet) {
                    if (featureSet) {
                        GraphicsController.highlight(featureSet.features);
                        MapController.zoom(featureSet.features);
                    }
                },
                function (err) {
                    topic.publish(config.topics.toast, err);
                }
            );
        },
        _submitOnEnter: function (evt) {
            // summary:
            //      calls query if enter was pressed
            //
            console.log('app.Query:_submitOnEnter', arguments);

            if (evt.keyCode === keys.ENTER) {
                this.query();
            }
        }
    });
});