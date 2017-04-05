/* eslint-disable no-unused-vars*/
var profile = {
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    selectorEngine: 'acme',
    noref: true,
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/packages',
                'app/run',
                'app/App',
                'dojox/gfx/filters',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'dojox/gfx/shape',
                'esri/layers/ArcGISDynamicMapServiceLayer',
                'esri/layers/LayerDrawingOptions',
                'esri/layers/VectorTileLayerImpl',
                'esri/layers/WebTiledLayer',
                'esri/dijit/Legend'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    packages: [{
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
          // don't bother with .hidden, tests, min, src, and templates
          ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function (filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    }, {
        name: 'agrc',
        location: 'agrc',
        main: 'agrc',
        trees: [
          // don't bother with anything but TRS... spin.js :X
          ['.', '.', /(\/\.)|(~$)|(map|MagicZoom|FindAddress|FindRouteMilePost|layer|_SpecRunner.html)/]
        ],
        resourceTags: {
            amd: function (filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    }],
    staticHasFeatures: {
        'dojo-trace-api': 0,
        'dojo-log-api': 0,
        'dojo-publish-privates': 0,
        'dojo-sync-loader': 0,
        'dojo-xhr-factory': 0,
        'dojo-test-sniff': 0,
        'extend-esri': 0,
        'config-deferredInstrumentation': 0,
        'config-dojo-loader-catches': 0,
        'config-tlmSiblingOfDojo': 0,
        'dojo-amd-factory-scan': 0,
        'dojo-combo-api': 0,
        'dojo-config-api': 1,
        'dojo-config-require': 0,
        'dojo-debug-messages': 0,
        'dojo-dom-ready-api': 1,
        'dojo-firebug': 0,
        'dojo-guarantee-console': 1,
        'dojo-has-api': 1,
        'dojo-inject-api': 1,
        'dojo-loader': 1,
        'dojo-modulePaths': 0,
        'dojo-moduleUrl': 0,
        'dojo-requirejs-api': 0,
        'dojo-sniff': 1,
        'dojo-timeout-api': 0,
        'dojo-undef-api': 0,
        'dojo-v1x-i18n-Api': 1,
        'dom': 1, // eslint-disable-line
        'host-browser': 1,
        'extend-dojo': 1
    },
    userConfig: {
        packages: ['app', 'agrc', 'dijit', 'dojox', 'esri', 'dgrid1', {
            name: 'toaster',
            location: './toaster/dist'
        }]
    }
};
