define([
    './Bookmark',
    './config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/text!./templates/BookmarkManager.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    Bookmark,
    config,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domConstruct,
    on,
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
        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/BookmarkManager::postCreate', arguments);

            this.adminBookmarks = ['uintah county', 'duchesne county', 'carbon county', 'grand county',
                'san juan county', 'utah'];

            this.setupConnections();

            this.bookmarks.forEach(function populateBookmarks(bookmark) {
                var props = {
                    bookmark: bookmark
                };

                if (this.adminBookmarks.indexOf(bookmark.name.toLowerCase()) > -1) {
                    props.admin = true;
                }

                this.list.appendChild(new Bookmark(props).domNode);
            }, this);

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
        save: function () {
            // summary:
            //      send a request to the api to create a Bookmark
            console.info('app/BookmarkManager:save', arguments);

            console.log(this.validate());
            // if (this.validate()) {
            // }
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
        remove: function () {
            // summary:
            //      send a request to the api to create a Bookmark
            console.info('app/BookmarkManager:remove', arguments);
        },
        _displayMessage: function (show, message) {
            // summary:
            //      shows an error message
            // show - boolean value whether to show the message
            // message - string to show
            console.log('app/BookmarkManager:_displayMessage', arguments);

            if (!show) {
                return;
            }

            this.message = message;
        }
    });
});
