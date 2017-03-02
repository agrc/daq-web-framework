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

    'esri/layers/FeatureLayer',
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

    FeatureLayer,
    Query
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      canned queries
        templateString: template,
        baseClass: 'query panel-body',

        cannedQueries: {
            number: '{term}={query}',
            string: 'UPPER({term}) LIKE UPPER(\'%{query}%\')'
        },

        // Properties to be sent into constructor

        // esri/layers that support query
        layers: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app.Query::postCreate', arguments);

            this.setupConnections();

            var layerType;
            this.layers.forEach(function (layer) {
                var name = layer.name.toLowerCase();
                if (name.indexOf('well') > -1) {
                    layerType = 'well';
                } else if (name.indexOf('facilit') > -1) {
                    layerType = 'facility';
                } else if (name.indexOf('permit') > -1) {
                    layerType = 'permit';
                } else {
                    return;
                }

                this.layer.appendChild(domConstruct.toDom('<option value="' +
                    layerType + '">' + layer.arcgisProps.title));
            }, this);

            var layerLookup = {};
            this.layers.forEach(function (layer) {
                layerLookup[layer.name] = layer;
            }, this);

            this.layers = layerLookup;

            this.updateQueriesForLayer();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.info('app.Query::setupConnections', arguments);

            on(this.input, 'keyup', lang.hitch(this, '_submitOnEnter'));
        },
        query: function () {
            // summary:
            //      description
            // param or return
            console.info('app.Query:query', arguments);

            this.activeLayer = this.layers[this.layer.options[this.layer.selectedIndex].text];
            this.activeLayer.setSelectionSymbol(config.symbols.point);

            var query = new Query();
            var queryInfo = config.queries[this.layer.value][this.type.value];
            var queryString = this.cannedQueries[queryInfo.type];
            query.where = lang.replace(queryString, {
                term: queryInfo.field,
                query: this.input.value
            });
            query.outFields = ['SHAPE'];

            this.activeLayer.selectFeatures(query, FeatureLayer.SELECTION_NEW).then(
                function (graphics) {
                    if (graphics && graphics.length > 0) {
                        MapController.zoom(graphics);
                        if (graphics.length === config.maxResult) {
                            topic.publish(config.topics.toast,
                                'The max number of features was returned. The results are a partial view.');
                        }
                    } else {
                        topic.publish(config.topics.toast, 'No features found. Check your spelling.');
                    }
                },
                function (err) {
                    topic.publish(config.topics.toast, (err.details[0] || err || '') +
                        ' Make sure the layer you are querying contains the ' + queryInfo.field + ' field.');
                }
            );
        },
        updateQueriesForLayer: function () {
            // summary:
            //      changes the available queries for the new layerId
            //
            console.info('app/Query:updateQueriesForLayer', arguments);

            var queryKey = this.layer.value;
            var queries = config.queries[queryKey];

            this._rebuildQuerySelect(queries);
        },
        _rebuildQuerySelect: function (queries) {
            // summary:
            //      description
            // param or return
            console.info('app/Query:_rebuildQuerySelect', arguments);

            domConstruct.empty(this.type);

            Object.keys(queries).forEach(function (key) {
                this.type.appendChild(domConstruct.toDom('<option value="' +
                    key + '">' + this._toProperCase(key)));
            }, this);
        },
        _submitOnEnter: function (evt) {
            // summary:
            //      calls query if enter was pressed
            //
            console.info('app/Query:_submitOnEnter', arguments);

            if (evt.keyCode === keys.ENTER) {
                this.query();
            }
        },
        _toProperCase: function (str) {
            // summary:
            //      description
            // param or return
            console.info('app/Query::_toProperCase', arguments);

            str = str.charAt(0).toUpperCase() + str.substring(1, str.length);

            return str.replace(/([A-Z])/g, ' $1');
        },
        destroy: function () {
            // summary:
            //      overload destroy to clear selections
            console.info('app.Query:destroy', arguments);

            if (this.activeLayer) {
                this.activeLayer.clearSelection();
            }

            this.inherited(arguments);
        }
    });
});
