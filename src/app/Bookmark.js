define([
    'dojo/_base/declare',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase'
], function (
    declare,

    _TemplatedMixin,
    _WidgetBase
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        postCreate: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app/Bookmark::postCreate', arguments);
        }
    });
});
