define([
    'agrc/widgets/locate/TRSsearch',
    'agrc/widgets/locate/ZoomToCoords',

    'app/AiNumber',
    'app/Attributes',
    'app/Buffer',
    'app/config',
    'app/GraphicsController',
    'app/MapController',
    'app/Query',
    'app/Bookmark',

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
    'dojo/request/xhr',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/Filter',
    'dstore/RequestMemory',

    'esri/arcgis/utils',
    'esri/dijit/LayerList',
    'esri/IdentityManager',

    'jquery',

    'bootstrap'
], function (
    TRSsearch,
    ZoomToCoords,

    AiNumber,
    Attributes,
    Buffer,
    config,
    GraphicsController,
    MapController,
    Query,
    Bookmarks,

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
    xhr,
    template,
    topic,
    array,
    declare,
    lang,

    Filter,
    RequestMemory,

    utils,
    LayerList,
    esriId,

    $
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

            this.initMap();

            GraphicsController.initialize(config, config.symbols);

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      Fires when
            console.info('app/App::setupConnections', arguments);

            var featureLayers = this.map.graphicsLayerIds;
            featureLayers.forEach(function (layerId) {
                var layer = this.map.getLayer(layerId);
                var clickHandler = lang.hitch(this, function (evt) {
                    this.showAttributes({
                        graphic: evt.graphic,
                        layerId: layer.layerId,
                        url: layer.url
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

            GraphicsController.graphicsLayer = this.map.graphics;
            MapController.initialize(this.map);
            $('a[data-toggle="tab"]').on('shown.bs.tab', lang.hitch(this, function (e) {
                if (e.target === this.edocsTab && !this.grid) {
                    this.initGrid();
                    this.grid.startup();
                }
            }));

            this.own(
                on(this.closeWindow, 'click', lang.hitch(this, 'close', this.infowindow)),
                on(this.closeTool, 'click', lang.hitch(this, 'close', this.toolbox)),
                topic.subscribe(config.topics.addAi, lang.hitch(this, 'onAiAdded')),
                topic.subscribe(config.topics.identify, lang.hitch(this, 'showAttributes')),
                topic.subscribe(config.topics.toast, lang.hitch(this, 'toast'))
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
                return this.toast('There was an issue logging in. Please try again later.');
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
            }));
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
                aliases: props.graphic._layer.aliases || null, // eslint-disable-line
                layerId: props.layerId,
                url: props.url,
                graphic: props.graphic
            };

            this.gridClickProps = props;

            this.attributes = new Attributes(props).placeAt(this.infocontent, 'first');

            domClass.remove(this.infowindow, 'hide');
            domClass.remove(this.attributepanel, 'hide');

            this.attributes.startup();

            var edocTab = $('#attribute-tabs a[href="#edocs"]');

            if (Object.keys(props.graphic.attributes).indexOf(config.fields.lock) === -1) {
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
                }
                if (this.grid) {
                    this.grid.destroy();
                    var gridParent = document.getElementById('edocs');
                    this.gridcontent = domConstruct.create('div', {}, gridParent, 'first');
                    this.grid = null;
                }
                if (this.attributes) {
                    this.attributes.destroy();
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

            var container = document.createElement('div');
            container.className = 'container';

            var containerRow = document.createElement('div');
            containerRow.className = 'row';

            var left = document.createElement('div');
            left.className = 'col-md-4 col-sm-12';

            var right = document.createElement('div');
            right.className = 'col-md-8 col-sm-12';

            var form = document.createElement('div');
            form.className = 'form-inline';

            var group = document.createElement('div');
            group.className = 'form-group';

            var label = document.createElement('label');
            label.setAttribute('for', 'search');
            label.innerHTML = 'Filter Grid';

            var input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('id', 'search');
            input.setAttribute('autocomplete', 'nope');
            input.className = 'form-control';
            input.addEventListener('input', lang.hitch(this, 'filterGrid'));

            group.appendChild(label);
            group.appendChild(document.createTextNode(' '));
            group.appendChild(input);
            left.appendChild(group);

            var uploadGroup = document.createElement('form');
            uploadGroup.className = 'form-group';
            uploadGroup.id = 'edoc-form';

            var uploadLabel = document.createElement('label');
            uploadLabel.setAttribute('for', 'attachment');
            uploadLabel.innerHTML = 'External File';

            var uploadInput = document.createElement('input');
            uploadInput.setAttribute('type', 'file');
            uploadInput.setAttribute('name', 'attachment');
            uploadInput.setAttribute('id', 'attachment');
            uploadInput.setAttribute('style', 'display: inline-block;');

            var uploadSubmit = document.createElement('button');
            uploadSubmit.innerHTML = 'attach';
            uploadSubmit.dataset.action = 'external';
            uploadSubmit.className = 'btn btn-default';

            uploadGroup.appendChild(uploadLabel);
            uploadGroup.appendChild(document.createTextNode(' '));
            uploadGroup.appendChild(uploadInput);
            uploadGroup.appendChild(document.createTextNode(' '));
            uploadGroup.appendChild(uploadSubmit);

            right.appendChild(uploadGroup);

            containerRow.appendChild(left);
            containerRow.appendChild(right);

            form.appendChild(containerRow);

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

            this.grid.footerNode.appendChild(form);

            aspect.before(this.grid, 'destroy', function () {
                input.removeEventListener('input', this.filterGrid);
            }.bind(this));

            this.grid.on('click', lang.hitch(this, 'onGridClick', this.gridClickProps));
            this.grid.on('dgrid-error', lang.hitch(this, 'toast'));
            this.grid.on('dgrid-error', lang.hitch(this.grid, 'destroy'));
            this.grid.set('collection', this.store);
        },
        filterGrid: function (evt) {
            var filter = new Filter();
            filter = filter.match('title', new RegExp(evt.target.value, 'i'));

            if (evt.target.value === '') {
                filter = {};
            }

            this.grid.set('collection', this.store.filter(filter));
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
                    return this.addAttachment(props, evt);
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

            this.toggleStatus(clicked, {
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

            var data = lang.replace(queryString, {
                edocId: row.id,
                featureId: props.graphic.attributes[config.fields.uniqueId],
                uploadId: row.uploadId,
                facilityId: props.graphic.attributes[config.fields.facilityId],
                url: props.url
            });

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
                    this.toast(json.error.messages || 'something went wrong');
                    this.toggleStatus(clicked, {
                        buttonText: 'error',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    row.uploadId = uploadId;
                    this.store.put(row, { overwrite: true });

                    return;
                }

                if ('addAttachmentResult' in json && json.addAttachmentResult.success === true) {
                    this.toggleStatus(clicked, {
                        buttonText: 'remove',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    row.uploadId = json.addAttachmentResult.objectId;
                    this.store.put(row, { overwrite: true });
                } else if ('deleteAttachmentResult' in json && json.deleteAttachmentResult.success === true) {
                    this.toggleStatus(clicked, {
                        buttonText: 'add',
                        buttonCss: 'btn btn-success',
                        disabled: false
                    });

                    row.uploadId = null;
                    this.store.put(row, { overwrite: true });
                }
            }), lang.hitch(this, function (error) {
                this.toggleStatus(clicked, {
                    buttonText: 'error, try again?',
                    buttonCss: 'btn btn-danger',
                    disabled: false
                });
                this.toast(error);
            }));
        },
        toast: function (message) {
            // summary:
            //      toast a message
            // click event
            console.info('app/App:toast', arguments);

            var fiveSeconds = 5000;
            var toaster = document.getElementById('toaster-container');
            var div = document.createElement('div');
            div.innerHTML = message.error || message;
            div.className = 'toaster-item alert alert-danger';

            toaster.appendChild(div);

            setTimeout(function () {
                toaster.removeChild(div);
            }, fiveSeconds);
        },
        toggleStatus: function (node, options) {
            // summary:
            //      global click handler for dgrid
            // click event
            console.info('app/App:toggleStatus', arguments);

            // invert css and button text depending
            node.className = options.buttonCss;
            if (node.tagName === 'BUTTON') {
                node.innerHTML = options.buttonText;
            } else {
                node.setAttribute('value', options.buttonText);
            }

            if (options.disabled) {
                node.setAttribute('disabled', 'disabled');
            } else {
                node.removeAttribute('disabled');
            }
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
                    layers: this.map.graphicsLayerIds.map(function (id) {
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
            } else if (targets.indexOf('layers') > -1) {
                this.activeTool = new LayerList({
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
        addAttachment: function (props, event) {
            // summary:
            //      send xhr post to api to save File
            // submit event
            console.info('app/App:addAttachment', arguments);


            var clicked = event.target;

            this.toggleStatus(clicked, {
                buttonText: 'processing',
                buttonCss: 'btn btn-warning',
                disabled: true
            });

            var form = new FormData(document.getElementById('edoc-form'));
            form.append('serviceUrl', props.url);
            form.append('featureId', props.graphic.attributes[config.fields.uniqueId]);
            form.append('token', 'shh');

            xhr(config.urls.webapi + '/upload/external', {
                method: 'post',
                data: form,
                headers: {
                    'X-Requested-With': null
                },
                handleAs: 'json'
            }).then(lang.hitch(this, function (json) {
                if (json.error) {
                    this.toast(json.error.messages || 'something went wrong');
                    this.toggleStatus(clicked, {
                        buttonText: 'error, try again?',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    return;
                }

                this.toggleStatus(clicked, {
                    buttonText: 'success',
                    buttonCss: 'btn btn-success',
                    disabled: false
                });
            }), lang.hitch(this, function (error) {
                this.toggleStatus(clicked, {
                    buttonText: 'error, try again?',
                    buttonCss: 'btn btn-danger',
                    disabled: false
                });

                this.toast(error);
            }));
        },
        _applyAliasProperty: function (lookup) {
            // summary:
            //      add an alias property to the layer for easier access
            // none
            console.log('app/App::_applyAliasProperty', arguments);

            Object.keys(lookup).forEach(function applyAlias(id) {
                var layer = this.map.getLayer(id);
                layer.aliases = lookup[id];
            }, this);
        }
    });
});
