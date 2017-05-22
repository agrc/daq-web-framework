define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/text!./templates/AssetViewer.html'
], function (
    _TemplatedMixin,
    _WidgetBase,

    declare,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      View attachments for a feature
        templateString: template,
        baseClass: 'asset-viewer',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/AssetViewer:postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        }
    });
});
