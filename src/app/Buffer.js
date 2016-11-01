define([
    'app/config',
    'app/GraphicsController',
    'app/MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/throttle',
    'dojo/text!app/templates/Buffer.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/geometryEngineAsync',
    'esri/graphic'
], function (
    config,
    GraphicsController,
    MapController,

    _TemplatedMixin,
    _WidgetBase,

    throttle,
    template,
    declare,
    lang,

    geometryEngineAsync,
    Graphic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        templateString: template,
        baseClass: 'buffer panel-body',
        active: false,
        delay: 100,

        // Properties to be sent into constructor

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
                this.subscription = MapController.map.on('mouse-move',
                                              throttle(lang.hitch(this, '_buffer'),
                                              this.delay));
            } else {
                this.subscription.remove();
                GraphicsController.removeGraphic();
            }

            this.own(this.subscription);
        },
        _buffer: function (evt) {
            // summary:
            //      buffer mouse cursor
            // unit: meters | feet | kilometers | miles | nautical-miles | yards
            console.log('app.Buffer:_buffer', arguments);

            geometryEngineAsync.buffer(evt.mapPoint, this.buffer.value, 'meters', true)
                .then(function (geometry) {
                    GraphicsController.highlight(new Graphic(geometry));
                });
        }
    });
});
