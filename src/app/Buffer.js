define([
    'app/config',
    'app/GraphicsController',
    'app/MapController',

    'dgrid/OnDemandGrid',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/templates/Buffer.html',
    'dojo/throttle',
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

    _TemplatedMixin,
    _WidgetBase,

    template,
    throttle,
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
            console.log('app.Buffer::postCreate', arguments);

            this.inherited(arguments);
        },
        activate: function () {
            // summary:
            //      wire events, and such
            console.log('app.Buffer::activate', arguments);

            this.active = !this.active;

            this.button.innerHTML = this.active ? 'Deactivate' : 'Activate';

            if (this.active) {
                this.subscriptions = [];
                this.subscriptions.push(MapController.map.on('mouse-move',
                                              throttle(lang.hitch(this, '_buffer'),
                                              this.delay)));
                this.subscriptions.push(MapController.map.on('click', lang.hitch(this, '_intersect')));
            } else {
                this.subscriptions.forEach(function removeSubscriptions(sub) {
                    sub.remove();
                });
                GraphicsController.removeGraphic();
            }

            this.own(this.subscriptions);
        },
        _buffer: function (evt) {
            // summary:
            //      buffer mouse cursor
            // unit: meters | feet | kilometers | miles | nautical-miles | yards
            console.log('app.Buffer:_buffer', arguments);

            geometryEngineAsync.buffer(evt.mapPoint, this.buffer.value, 'meters', true)
                .then(function highlight(geometry) {
                    GraphicsController.highlight(new Graphic(geometry));
                });
        },
        _intersect: function (evt) {
            // summary:
            //      description
            // param or return
            console.log('app.Buffer:_intersect', arguments);

            var data = [];
            if (!this.grid) {
                this.grid = new Grid({
                    className: 'dgrid-buffer dgrid-autoheight',
                    columns: {
                        ai: {
                            label: 'AI Number',
                            sortable: true
                        },
                        api: {
                            label: 'API',
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

                this.grid.startup();
            }

            geometryEngineAsync.buffer(evt.mapPoint, this.buffer.value, 'meters', true)
                .then(function getGraphicsFromLayers(geometry) {
                    this.layers.forEach(function testGraphics(layer) {
                        layer.graphics.forEach(function testGeometry(graphic) {
                            if (geometryEngine.contains(geometry, graphic.geometry)) {
                                data.push({
                                    ai: graphic.attributes.AiNumber,
                                    api: graphic.attributes.API,
                                    company: graphic.attributes.COMPANY_NA,
                                    id: graphic.attributes.FID
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
        }
    });
});
