define([
    './Bookmark',
    './config',
    './MapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/request/xhr',
    'dojo/text!./templates/BookmarkManager.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    Bookmark,
    config,
    MapController,

    _TemplatedMixin,
    _WidgetBase,

    domAttr,
    domClass,
    domConstruct,
    xhr,
    template,
    topic,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      a container to hold and manage the creation and deletion of bookmarks
        templateString: template,
        baseClass: 'bookmark-manager',

        adminBookmarks: null,

        urls: {
            add: '/bookmarks/add',
            remove: '/bookmarks/remove'
        },

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/BookmarkManager::postCreate', arguments);

            this.adminBookmarks = ['uintah county', 'duchesne county', 'carbon county', 'grand county',
                'san juan county', 'utah'];

            this.setupConnections();

            this._rebuildBookmarks(this.bookmarks);

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.info('app/BookmarkManager::setupConnections', arguments);

            this.own(
                topic.subscribe(config.topics.removeBookmark, lang.hitch(this, 'remove'))
            );
        },
        showForm: function () {
            // summary:
            //      shows the form to create a bookmark
            console.info('app/BookmarkManager:showForm', arguments);

            domClass.toggle(this.createForm, 'hidden');
            this.userName.focus();
        },
        add: function () {
            // summary:
            //      send a request to the api to create a Bookmark
            console.info('app/BookmarkManager:add', arguments);

            if (!this.validate()) {
                return;
            }

            this._displayMessage(true, '');

            domClass.add(this.button, 'disabled');
            domAttr.set(this.button, 'disabled', true);

            var url = config.urls.webapi + this.urls.add;
            xhr(url, {
                method: 'post',
                data: JSON.stringify({
                    name: this.userName.value + '-' + this.bookmarkName.value,
                    extent: MapController.map.extent.toJson(),
                    desktopId: config.urls.webMap.desktop,
                    collectorId: config.urls.webMap.collector
                }),
                headers: {
                    'X-Requested-With': null,
                    'Content-Type': 'application/json'
                },
                handleAs: 'json'
            }).then(lang.hitch(this, '_handleUpdate', 'add', null));
        },
        remove: function (widget) {
            // summary:
            //      send a request to the api to create a Bookmark
            console.info('app/BookmarkManager:remove', arguments);

            this._displayMessage(true, '');

            var url = config.urls.webapi + this.urls.remove;
            xhr(url, {
                method: 'delete',
                data: {
                    name: widget.bookmark.name,
                    desktopId: config.urls.webMap.desktop,
                    collectorId: config.urls.webMap.collector
                },
                headers: {
                    'X-Requested-With': null
                },
                handleAs: 'json'
            }).then(lang.hitch(this, '_handleUpdate', 'remove', widget));
        },
        validate: function () {
            // summary:
            //      validate against empty or duplicates
            console.info('app/BookmarkManager:validate', arguments);

            var hasDuplicate = this.bookmarks.some(function sameName(bookmark) {
                return bookmark.name === this.userName.value + '-' + this.bookmarkName.value;
            }, this);

            this._displayMessage(hasDuplicate,
                'There already is a bookmark with this value. Please create a unique combination.');

            var goodData = this.userName.value.length > 0 && this.bookmarkName.value.length > 0;

            this._displayMessage(!goodData,
                'The username and bookmark name are required for saving. Please do not leave them blank');

            return goodData && !hasDuplicate;
        },
        _displayMessage: function (show, message) {
            // summary:
            //      shows an error message
            // show - boolean value whether to show the message
            // message - string to show
            console.info('app/BookmarkManager:_displayMessage', arguments);

            if (!show) {
                return;
            }

            this.warning.innerHTML = message;
        },
        _handleUpdate: function (update, widget, response) {
            // summary:
            //      runs after a bookmark request is responded to
            console.info('app/BookmarkManager:_handleUpdate:', arguments);

            domClass.remove(this.button, 'disabled');
            domAttr.remove(this.button, 'disabled');

            if (response.error) {
                this._displayMessage(true, response.error.message);

                if (update === 'remove') {
                    domClass.remove(widget.close, 'hidden');
                }

                return;
            }

            this.bookmarks = response;
            this._rebuildBookmarks(this.bookmarks);

            if (update === 'add') {
                this.showForm();
            }
        },
        _rebuildBookmarks: function (bookmarks) {
            // summary:
            //      recreates the bookmarks
            console.info('app/BookmarkManager:_rebuildBookmarks', arguments);

            domConstruct.empty(this.list);

            bookmarks.forEach(function populateBookmarks(bookmark) {
                var props = {
                    bookmark: bookmark
                };

                if (this.adminBookmarks.indexOf(bookmark.name.toLowerCase()) > -1) {
                    props.admin = true;
                }

                this.list.appendChild(new Bookmark(props).domNode);
            }, this);
        }
    });
});
