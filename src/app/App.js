define([
    'agrc/widgets/locate/TRSsearch',
    'agrc/widgets/locate/ZoomToCoords',

    './AiNumber',
    './AssetViewer',
    './Attributes',
    './Bookmark',
    './Buffer',
    './config',
    './GraphicsController',
    './GridFooter',
    './MapController',
    './ToggleButtonStatus',
    './Query',

    'dgrid1/extensions/SingleQuery',
    'dgrid1/Grid',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/on',
    'dojo/keys',
    'dojo/request/xhr',
    'dojo/text!./templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/RequestMemory',

    'esri/arcgis/utils',
    'esri/dijit/LayerList',
    'esri/IdentityManager',

    'jquery',

    'toaster/Toaster',


    'bootstrap'
], function (
    TRSsearch,
    ZoomToCoords,

    AiNumber,
    AssetViewer,
    Attributes,
    Bookmarks,
    Buffer,
    config,
    GraphicsController,
    GridFooter,
    MapController,
    ToggleButtonStatus,
    Query,

    SingleQuery,
    Grid,

    _TemplatedMixin,
    _WidgetBase,

    aspect,
    dom,
    domClass,
    domConstruct,
    domStyle,
    on,
    keys,
    xhr,
    template,
    topic,
    array,
    declare,
    lang,

    RequestMemory,

    utils,
    LayerList,
    esriId,

    $,

    Toaster
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // summary:
        //      The main widget for the app

        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: agrc.widgets.map.Basemap
        map: null,

        // digest: string
        //      the oauth token for arcgis online
        digest: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app/App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.info('app/App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            var toaster = new Toaster.default({ // eslint-disable-line new-cap
                topic: config.topics.toast
            }, domConstruct.create('div', {}, document.body));
            toaster.startup();

            this.initMap();

            GraphicsController.initialize(config, config.symbols);

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      Fires when
            console.info('app/App::setupConnections', arguments);

            GraphicsController.graphicsLayer = this.map.graphics;

            var featureLayers = this.map.graphicsLayerIds.concat(this.map.graphics.id);
            featureLayers.forEach(function (layerId) {
                var layer = this.map.getLayer(layerId);
                var clickHandler = lang.hitch(this, function (evt) {
                    var id = layer.layerId;
                    // both values can be 0 or undefined so...
                    if (isNaN(id)) {
                        id = evt.graphic.layerId;
                    }

                    this.showAttributes({
                        graphic: evt.graphic,
                        layerId: id,
                        url: layer.url || evt.graphic.url
                    });
                });

                if (layer.loaded === true) {
                    layer.on('click', clickHandler);
                } else {
                    layer.on('load', function (l) {
                        l.on('click', clickHandler);
                    });
                }
            }, this);

            this._applyAliasProperty(this.aliasLookup);

            MapController.initialize(this.map);

            $('a[data-toggle="tab"]').on('shown.bs.tab', lang.hitch(this, function (e) {
                if (e.target.hash === '#edocs') {
                    if (this.grid) {
                        return;
                    }

                    this.initGrid();
                    this.grid.startup();
                    this.footer.startup();

                    return;
                }
                if (e.target.hash === '#attachments') {
                    this.assetViewer.startup();
                    this.assetViewer.showAssets();

                    return;
                }
            }));

            this.own(
                on(document, 'keydown', lang.hitch(this, 'keyboardShortcut')),
                on(this.closeWindow, 'click', lang.hitch(this, 'close', this.infowindow)),
                on(this.closeTool, 'click', lang.hitch(this, 'close', this.toolbox)),
                topic.subscribe(config.topics.addAi, lang.hitch(this, 'onAiAdded')),
                topic.subscribe(config.topics.identify, lang.hitch(this, 'showAttributes'))
            );
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.info('app/App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                console.info(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app/App::initMap', arguments);

            if (!this.digest) {
                return topic.publish(config.topics.toast, {
                    message: 'There was an issue logging in. Please try again later.',
                    type: 'danger'
                });
            }

            var token = {
                token: this.digest,
                expires: 120000,
                server: config.urls.agol,
                userId: 'DAQ OAuth App',
                ssl: false
            };

            esriId.registerToken(token);

            utils.arcgisurl = config.urls.agol;
            utils.createMap(config.urls.webMap, 'map-div', {
                ignorePopups: true,
                mapOptions: {
                    showAttribution: false
                }
            }).then(lang.hitch(this, function (result) {
                this.map = result.map;
                this.layers = utils.getLayerList(result);
                this.bookmarks = result.itemInfo.itemData.bookmarks;

                this.aliasLookup = {};
                var operationalLayers = result.itemInfo.itemData.operationalLayers;
                operationalLayers.forEach(function buildAliasLookup(layer) {
                    if (!layer.popupInfo) {
                        return;
                    }

                    var visibleFields = layer.popupInfo.fieldInfos.filter(function keepVisible(item) {
                        return item.visible;
                    });

                    this.aliasLookup[layer.id] = visibleFields.map(function reduceProp(prop) {
                        var lookup = {};
                        lookup[prop.fieldName] = prop.label;

                        return {
                            field: prop.fieldName,
                            alias: prop.label
                        };
                    });
                }, this);

                while (!this.layers.every(function waitUntilLoad(layer) {
                    return layer.layer.loaded;
                })) {
                    // wait?
                }

                if (this.map.loaded === true) {
                    this.setupConnections();

                    return;
                }

                this.map.on('load', function () {
                    this.setupConnections();
                }).bind(this);
            }), function (error) {
                topic.publish(config.topics.toast, {
                    message: error.message || 'something went terribly wrong',
                    type: 'danger'
                });
            });
        },
        showAttributes: function (props) {
            // summary:
            //      shows the attributes for the clicked point
            // param or return
            console.info('app/App:showAttributes', arguments);

            if (!props.graphic) {
                return;
            }

            props = {
                aliases: props.graphic._layer.aliases || props.graphic.aliases || null, // eslint-disable-line
                layerId: props.layerId,
                url: props.url,
                graphic: props.graphic
            };

            this.gridClickProps = props;

            this.attributes = new Attributes(props).placeAt(this.infocontent, 'first');
            this.assetViewer = new AssetViewer({
                options: props
            }).placeAt(this.attachmentContent, 'first');

            domClass.remove(this.infowindow, 'hide');
            domClass.remove(this.attributepanel, 'hide');

            this.attributes.startup();

            var edocTab = $('#attribute-tabs a[href="#edocs"]');

            config.fields.lock = this._findLockField(config.fields.locks, props.graphic.attributes);

            if (!config.fields.lock) {
                console.debug('layer does not have AI number. do not show ai widget.');
                edocTab.prop('disabled', true).addClass('disabled-tab');

                return;
            }

            var aiProps = props;
            aiProps.token = this.digest;

            if (props.graphic.attributes[config.fields.lock]) {
                console.debug('lock field has value. giving update option.');

                edocTab.prop('disabled', false).removeClass('disabled-tab');

                // setup ai number for later calls
                this.gridClickProps.aiNumber = props.aiNumber = props.graphic.attributes[config.fields.lock];
                this.setupGridStore(props);
            } else {
                console.debug('lock field is empty. showing add lock data');

                this.gridClickProps = aiProps;
                this.gridClickProps.graphic = props.graphic;

                edocTab.prop('disabled', true).addClass('disabled-tab');
            }

            this.ai = new AiNumber(aiProps).placeAt(this.infocontent, 'after');
            this.ai.startup();
        },
        close: function (parent) {
            // summary:
            //      hides things
            // param or return
            console.info('app/App:close', arguments);

            domClass.add(parent, 'hide');

            if (parent === this.infowindow) {
                if (this.ai) {
                    this.ai.destroy();
                    this.ai = null;
                }
                if (this.grid) {
                    this.grid.destroy();
                    var gridParent = document.getElementById('edocs');
                    this.gridcontent = domConstruct.create('div', {}, gridParent, 'first');
                    this.grid = null;
                }
                if (this.attributes) {
                    this.attributes.destroy();
                    this.attributes = null;
                }
                if (this.assetViewer) {
                    this.assetViewer.destroy();
                    this.assetViewer = null;
                }

                this.infocontent.innerHTML = '';

                $('#attribute-tabs a:first').tab('show');
            } else if (parent === this.toolbox) {
                if (this.activeTool) {
                    this.activeTool.destroy();
                    this.activeTool = null;
                }
            }
        },
        setupGridStore: function (props) {
            // summary:
            //      setup the dgrid
            console.info('app/App:setupGridStore', arguments);

            this.store = new RequestMemory({
                target: config.urls.webapi + '/search/' + props.aiNumber +
                        '/facility/' + props.graphic.attributes[config.fields.facilityId] +
                        '/feature/' + props.graphic.attributes[config.fields.uniqueId] +
                        '?url=' + encodeURIComponent(props.url),
                useRangeHeaders: false,
                headers: {
                    'X-Requested-With': null,
                    'Content-Type': 'text/plain'
                }
            });
        },
        initGrid: function () {
            // summary:
            //      setup the grid after the tab is focused
            // undefined
            console.info('app/App:initGrid', arguments);

            if (this.grid) {
                this.grid.destroy();
                var gridParent = document.getElementById('edocs');
                this.gridcontent = domConstruct.create('div', {}, gridParent, 'first');
                this.grid = null;
            }

            var ComposedGrid = declare([Grid, SingleQuery]);
            this.grid = new ComposedGrid({
                class: 'dgrid-main full-height',
                loadingMessage: 'Loading data...',
                noDataMessage: 'No results found.',
                showFooter: true,
                columns: {
                    branch: {
                        label: 'Branch',
                        sortable: true
                    },
                    documentDate: {
                        label: 'Date',
                        sortable: true,
                        formatter: function (value) {
                            return new Date(value).toLocaleDateString();
                        }
                    },
                    file: {
                        label: 'File',
                        sortable: false
                    },
                    title: {
                        label: 'Title',
                        sortable: true
                    },
                    id: {
                        label: 'Action',
                        sortable: false,
                        formatter: function (value, row) {
                            if (row.uploaded) {
                                return '<button class="btn btn-danger" data-action="edoc" value="' +
                                        value + '">remove</button>';
                            }

                            return '<button class="btn btn-success" data-action="edoc" value="' +
                                    value + '">add</button>';
                        }
                    }
                }
            }, this.gridcontent);

            this.footer = new GridFooter({
                parent: this
            });
            this.grid.footerNode.appendChild(this.footer.domNode);

            aspect.before(this.grid, 'destroy', function () {
                this.footer.destroy();
            }.bind(this));

            this.grid.on('click', lang.hitch(this, 'onGridClick', this.gridClickProps));
            this.grid.on('dgrid-error', function (evt) {
                topic.publish(config.topics.toast, {
                    message: evt.error.message || 'something went terribly wrong',
                    type: 'danger'
                });
            });
            this.grid.on('dgrid-error', lang.hitch(this.grid, 'destroy'));
            this.grid.set('collection', this.store);
        },
        onGridClick: function (props, evt) {
            // summary:
            //      global click handler for dgrid
            // click event
            console.info('app/App:onGridClick', arguments);

            var clicked = evt.target;
            if (clicked.tagName !== 'BUTTON') {
                return;
            }

            switch (clicked.dataset.action) {
                case 'edoc':
                    return this.processEdocItem(props, evt);
                case 'external':
                    this.footer.gridProps = props;

                    return;
                default:
                    return;
            }
        },
        processEdocItem: function (props, evt) {
            // summary:
            //      upload edoc documents
            // click event
            console.info('app/App:processEdocItem', arguments);

            var clicked = evt.target;

            var row = this.grid.row(evt).data;
            var uploadId = row.uploadId;
            var method = uploadId ? 'DELETE' : 'POST';

            ToggleButtonStatus.toggle(clicked, {
                buttonText: 'processing',
                buttonCss: 'btn btn-warning',
                disabled: true,
                added: uploadId
            });

            row.uploadId = uploadId || null;
            this.store.put(row, {
                overwrite: true
            });

            var queryString = 'id={edocId}&' +
                              'facilityId={facilityId}&' +
                              'featureId={featureId}&' +
                              'uploadId={uploadId}&' +
                              'serviceUrl={url}';

            var queryData = {
                edocId: row.id,
                featureId: props.graphic.attributes[config.fields.uniqueId],
                uploadId: row.uploadId,
                facilityId: props.graphic.attributes[config.fields.facilityId],
                url: props.url
            };

            if (Object.keys(props.graphic.attributes).indexOf(config.fields.facilityId) === -1) {
                queryData.facilityId = 'permit';
            }

            var data = lang.replace(queryString, queryData);

            xhr(config.urls.webapi + '/upload', {
                method: method,
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': null
                },
                handleAs: 'json'
            }).then(lang.hitch(this, function (json) {
                if (json.error) {
                    topic.publish(config.topics.toast, {
                        message: json.error.messages || 'something went wrong',
                        type: 'danger'
                    });

                    ToggleButtonStatus.toggle(clicked, {
                        buttonText: 'error',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    row.uploadId = uploadId;
                    this.store.put(row, { overwrite: true });

                    return;
                }

                if ('addAttachmentResult' in json && json.addAttachmentResult.success === true) {
                    ToggleButtonStatus.toggle(clicked, {
                        buttonText: 'remove',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    row.uploadId = json.addAttachmentResult.objectId;
                    this.store.put(row, { overwrite: true });
                    topic.publish(config.topics.dirtyAssets);
                } else if ('deleteAttachmentResult' in json && json.deleteAttachmentResult.success === true) {
                    ToggleButtonStatus.toggle(clicked, {
                        buttonText: 'add',
                        buttonCss: 'btn btn-success',
                        disabled: false
                    });

                    row.uploadId = null;
                    this.store.put(row, { overwrite: true });
                    topic.publish(config.topics.dirtyAssets);
                }
            }), lang.hitch(this, function (error) {
                ToggleButtonStatus.toggle(clicked, {
                    buttonText: 'error, try again?',
                    buttonCss: 'btn btn-danger',
                    disabled: false
                });
                topic.publish(config.topics.toast, {
                    message: error,
                    type: 'danger'
                });
            }));
        },
        onAiAdded: function (props) {
            // summary:
            //      called when a new ai number is added
            //
            console.info('app.app:onAiAdded', arguments);

            this.setupGridStore(props);
            this.initGrid();

            $('#attribute-tabs a[href="#edocs"]').prop('disbled', false).removeClass('disabled-tab').tab('show');
            this.grid.startup();
        },
        activateTool: function (evt) {
            // summary:
            //      description
            // param or return
            console.info('app/App:activateTool', arguments);

            if (this.activeTool) {
                this.activeTool.destroy();
                this.activeTool = null;
            }

            domClass.remove(this.toolbox, 'hide');

            var targets = [evt.target.id, evt.target.parentElement.id];

            if (targets.indexOf('query') > -1) {
                this.activeTool = new Query({
                    layers: this.map.graphicsLayerIds.map(function (id) {
                        return this.map.getLayer(id);
                    }, this)
                }).placeAt(this.toolboxcontainer, 'after');
                this.toolboxheader.innerHTML = 'Select Items with Query';
            } else if (targets.indexOf('buffer') > -1) {
                this.activeTool = new Buffer({
                    intersectLayers: this.map.graphicsLayerIds.map(function (id) {
                        return this.map.getLayer(id);
                    }, this).filter(function (layer) {
                        return layer.fields.some(function (field) {
                            return field.name === config.fields.lock;
                        });
                    })
                }).placeAt(this.toolboxcontainer, 'after');
                this.toolboxheader.innerHTML = 'Select Items with Buffer Radius';
            } else if (targets.indexOf('trs') > -1) {
                this.activeTool = new TRSsearch({
                    map: this.map,
                    apiKey: config.apiKey
                }).placeAt(this.toolboxcontainer, 'after');
                this.toolboxheader.innerHTML = 'Zoom to Township Range Section';

                this.activeTool.onZoom = function (graphic) {
                    GraphicsController.highlight(graphic, config.symbols.trs);
                };

                aspect.before(this.activeTool, 'destroy', function () {
                    GraphicsController.removeGraphic();
                });
            } else if (targets.indexOf('layers') > -1) {
                this.activeTool = new LayerList({
                    showLegend: true,
                    map: this.map,
                    layers: this.layers
                }).placeAt(this.toolboxcontainer, 'after');
                this.toolboxheader.innerHTML = 'Toggle Visible Layers';
            } else if (targets.indexOf('coords') > -1) {
                this.activeTool = new ZoomToCoords({
                    map: this.map,
                    zoomLevel: 16
                }).placeAt(this.toolboxcontainer, 'after');
                this.toolboxheader.innerHTML = 'Zoom to a Specific Coordinate';
            } else if (targets.indexOf('bookmark') > -1) {
                var wtfEsri = domConstruct.place('<div></div>', this.toolboxcontainer, 'after');
                this.activeTool = new Bookmarks({
                    map: this.map,
                    bookmarks: this.bookmarks
                }, wtfEsri);
                this.toolboxheader.innerHTML = 'Zoom to Bookmarked Location';
            } else {
                this.toolboxheader.innerHTML = 'Tool Container';

                return;
            }

            this.activeTool.startup();
        },
        _applyAliasProperty: function (lookup) {
            // summary:
            //      add an alias property to the layer for easier access
            // none
            console.info('app/App::_applyAliasProperty', arguments);

            Object.keys(lookup).forEach(function applyAlias(id) {
                var layer = this.map.getLayer(id);
                layer.aliases = lookup[id];
            }, this);
        },
        keyboardShortcut: function (evt) {
            // summary:
            //      description
            // param or return
            console.info('app/App:keyboardShortcut', arguments);

            switch (evt.keyCode) {
                case keys.ESCAPE: {
                    this.close(this.infowindow);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        _findLockField: function (lockFields, attributes) {
            // summary:
            //      return the string value of the lock field or null
            // string or null
            console.info('app/App:_findLockField', arguments);

            var name = null;
            lockFields.forEach(function (lock) {
                if (Object.keys(attributes).indexOf(lock) > -1) {
                    name = lock;
                }
            });

            return name;
        }
    });
});
