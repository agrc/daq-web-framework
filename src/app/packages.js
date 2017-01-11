require({
    packages: [
        'app',
        'dgauges',
        'dgrid',
        'dgrid1',
        'dijit',
        'dojo',
        'dojox',
        'dstore',
        'esri',
        'moment',
        'put-selector',
        'xstyle',
        {
            name: 'bootstrap',
            location: './bootstrap',
            main: 'dist/js/bootstrap'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'stubmodule',
            location: './stubmodule',
            main: 'src/stub-module'
        }
    ],
    map: {
        dgrid1: {
            dgrid: 'dgrid1'
        }
    }
});
