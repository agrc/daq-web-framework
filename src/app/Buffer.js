define([
    'app/config',
    'app/GraphicsController',
    'app/MapController',

    'dgrid/OnDemandGrid',
    'dgrid/Selection',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/Buffer.html',
    'dojo/throttle',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/Memory',

    'esri/geometry/geometryEngine',
    'esri/geometry/geometryEngineAsync',
    'esri/graphic'
], function (
    config,
    GraphicsController,
    MapController,

    Grid,
    Selection,

    _TemplatedMixin,
    _WidgetBase,

    template,
    throttle,
    topic,
    declare,
    lang,

    Memory,

    geometryEngine,
    geometryEngineAsync,
    Graphic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        templateString: template,
        baseClass: 'buffer panel-body',
        active: false,
        delay: 100,
        subscriptions: null,

        // Properties to be sent into constructor
        layers: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app.Buffer::postCreate', arguments);

            this.inherited(arguments);
            this.subscriptions = [];
        },
        activate: function () {
            // summary:
            //      wire events, and such
            console.info('app.Buffer::activate', arguments);

            this.active = !this.active;

            this.button.innerHTML = this.active ? 'Deactivate' : 'Activate';

            if (this.active) {
                this.subscriptions.push(MapController.map.on('mouse-move',
                                              throttle(lang.hitch(this, '_buffer'),
                                              this.delay)));
                this.subscriptions.push(MapController.map.on('click', lang.hitch(this, '_intersect')));
            } else {
                this._destroy();
            }
        },
        _buffer: function (evt) {
            // summary:
            //      buffer mouse cursor
            // unit: meters | feet | kilometers | miles | nautical-miles | yards
            console.info('app.Buffer:_buffer', arguments);

            geometryEngineAsync.buffer(evt.mapPoint, this.buffer.value, 'meters', true)
                .then(function highlight(geometry) {
                    GraphicsController.highlight(new Graphic(geometry));
                });
        },
        _intersect: function (evt) {
            // summary:
            //      description
            // param or return
            console.info('app.Buffer:_intersect', arguments);

            var data = [];
            this._initGrid();

            geometryEngineAsync.buffer(evt.mapPoint, this.buffer.value, 'meters', true)
                .then(function getGraphicsFromLayers(geometry) {
                    this.layers.forEach(function testGraphics(layer) {
                        layer.graphics.forEach(function testGeometry(graphic) {
                            if (geometryEngine.contains(geometry, graphic.geometry)) {
                                data.push({
                                    ai: graphic.attributes[config.fields.lock],
                                    api: graphic.attributes.API,
                                    company: graphic.attributes[config.fields.queryOne],
                                    id: graphic.attributes[config.fields.uniqueId],
                                    graphic: graphic
                                });
                            }
                        });
                    });

                    this.store = new Memory({
                        data: data
                    });

                    this.grid.set('collection', this.store);
                }.bind(this)
            );
        },
        _initGrid: function () {
            // summary:
            //      description
            // param or return
            console.log('app.Buffer:_initGrid', arguments);

            if (!this.grid) {
                var ComposedGrid = declare([Grid, Selection]);
                this.grid = new ComposedGrid({
                    className: 'dgrid-buffer dgrid-autoheight',
                    selectionMode: 'single',
                    columns: {
                        ai: {
                            label: 'AI Number',
                            sortable: true
                        },
                        company: {
                            label: 'Owner',
                            sortable: true
                        },
                        id: {
                            label: 'hidden',
                            sortable: false
                        }
                    }
                }, this.gridcontent);

                this.grid.on('dgrid-select', function (event) {
                    // Get the rows that were just selected
                    var row = event.rows[0].data;
                    var props = {
                        graphic: row.graphic,
                        attributes: row.graphic.attributes,
                        layerId: row.graphic.layerId,
                        url: row.graphic.url
                    };

                    topic.publish(config.topics.identify, props);
                });

                this.grid.startup();
            }
        },
        _destroy: function () {
            // summary:
            //      description
            // param or return
            console.info('app.Buffer:_destroy', arguments);

            this.subscriptions.forEach(function removeSubscriptions(sub) {
                sub.remove();
            });
            this.subscriptions = [];
            GraphicsController.removeGraphic();
        },
        destroy: function () {
            // summary:
            //      description
            // param or return
            console.info('app.Buffer:destroy', arguments);

            this._destroy();

            this.inherited(arguments);
        }
    });
});