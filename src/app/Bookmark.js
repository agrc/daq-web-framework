define([
    './config',
    './MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!./templates/Bookmark.html',
    'dojo/topic',
    'dojo/_base/declare',

    'esri/geometry/Extent',
    'esri/graphic'
], function (
    config,
    MapController,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    template,
    topic,
    declare,

    Extent,
    Graphic
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'bookmark',

        postCreate: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app/Bookmark::postCreate', arguments);

            if (this.admin === true) {
                domConstruct.destroy(this.close);
                domClass.replace(this.glyph, 'glyphicon-globe', 'glyphicon-user');

                return;
            }
        },
        zoom: function () {
            //      zoom to the bookmark extent
            console.info('app/Bookmark::zoom', arguments);

            MapController.zoom(new Graphic(new Extent(this.bookmark.extent)));
        },
        remove: function () {
            // summary:
            //      catch the event to remove the bookmark
            console.info('app/Bookmark::remove', arguments);

            topic.publish(config.topics.removeBookmark, this);
            domClass.add(this.close, 'hidden');
        },
        delete: function () {
            // summary:
            //      catch the event to remove the bookmark
            console.info('app/Bookmark::_remove', arguments);

            this.destroy();
        }
    });
});
