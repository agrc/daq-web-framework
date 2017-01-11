define(['dojo/has'], function (has) {
    var agol = 'http://utahdeq.maps.arcgis.com';

    var config = {
        appName: 'daq-web',
        appId: 'Uri0b5yIFpHSFulo',
        version: '1.0.0',
        fields: {
            uniqueId: 'OBJECTID',
            lock: 'AI_Number',
            queryOne: 'Comp_Name'
        },
        topics: {
            addAi: '1',
            toast: '2',
            graphics: {
                highlight: '3',
                clear: '4'
            },
            identify: '5'
        },
        urls: {
            webapi: 'http://localhost:5000',
            webMap: '6ad68af1ab6349579cc0af364b49dccd',
            agol: agol + '/sharing',
            agolHome: agol
        },
        symbols: {
            point: {},
            line: {},
            poly: {}
        }
    };

    if (has('agrc-build') === 'prod' || has('agrc-build') === 'stage') {
        config.urls.webapi = '/daq';
    }

    return config;
});
