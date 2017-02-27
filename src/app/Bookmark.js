define([
    'dijit/registry',

    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/dijit/Bookmarks'
], function (
    registry,

    array,
    declare,
    lang,

    Bookmarks
) {
    return declare([Bookmarks], {
        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app/Bookmark::constructor', arguments);

            // TODO: remove after upgrading to 3.21
            var original = Bookmarks.prototype.destroy;
            Bookmarks.prototype.destroy = function (preserveDom) {
                console.info('app/Bookmark::destroy', arguments);

                original.apply(this);
                this._beingDestroyed = true;
                this.uninitialize();

                function destroy(w) {
                    if (w.destroyRecursive) {
                        w.destroyRecursive(preserveDom);
                    } else if (w.destroy) {
                        w.destroy(preserveDom);
                    }
                }

                // Back-compat, remove for 2.0
                array.forEach(this._connects, lang.hitch(this, 'disconnect'));
                array.forEach(this._supportingWidgets, destroy);

                if (this.domNode) {
                    array.forEach(registry.findWidgets(this.domNode, this.containerNode), destroy);
                }

                this.destroyRendering(preserveDom);
                registry.remove(this.id);
                this._destroyed = true;
            };
        }
    });
});
