define([
    './config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/text!./templates/AssetViewer.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/request/xhr'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    Deferred,
    domConstruct,
    template,
    topic,
    declare,
    lang,
    xhr
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      View attachments for a feature
        templateString: template,
        baseClass: 'asset-viewer',
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
            10: 3,
            11: 3
        },

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/AssetViewer:postCreate', arguments);

            this.inherited(arguments);

            this.url = config.urls.webapi + '/attachment/' +
                       this.options.graphic.attributes[config.fields.uniqueId] +
                       '?url=' + encodeURIComponent(this.options.url);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.info('app/AssetViewer:setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.dirtyAssets, lang.hitch(this, '_invalidateCache'))
            );
        },
        showAssets: function () {
            // summary:
            //      description
            // param or return
            console.info('app/AssetViewer:showAssets', arguments);

            this._populateCache().then(lang.hitch(this, '_displayItems'));
        },
        _populateCache: function () {
            // summary:
            //      description
            // param or return
            console.info('app/AssetViewer:_populateCache', arguments);

            var promise = xhr(this.url, {
                handleAs: 'json'
            });

            return promise;
        },
        _invalidateCache: function () {
            // summary:
            //      description
            // param or return
            console.info('module.id:_invalidateCache', arguments);

            if (!this.attachments) {
                return;
            }

            this._populateCache();
        },
        _displayItems: function (result) {
            // summary:
            //      description
            // param or return
            console.info('app/AssetViewer:_displayItems', arguments);

            if (result.error) {
                domConstruct.empty(this.container);

                return topic.publish(config.topics.toast, {
                    message: result.error.messages,
                    type: 'danger'
                });
            }

            var length = result.files.length;
            var size = this.breakpoints[length % this.columns];

            if (length === 0) {
                domConstruct.create('p', {
                    className: 'row',
                    innerHTML: 'This feature does not have any attachments.'
                }, this.container, 'only');

                return;
            }

            this.attachments = result.files;

            domConstruct.empty(this.container);

            var row;
            result.files.forEach(function (item, i) {
                if (i * size % this.columns === 0) {
                    row = domConstruct.create('div', {
                        className: 'row'
                    }, this.container, 'last');
                }

                var cell = domConstruct.create('div', {
                    className: 'form-group col-xs-6 col-sm-' + size + ' col-md-' + size
                }, row);

                domConstruct.create('a', {
                    href: item.url,
                    target: '_blank',
                    innerHTML: item.name
                }, cell);
            }, this);
        }
    });
});
