define([
    'esri/symbols/SimpleMarkerSymbol',

    'dojo/has'
], function (
        SimpleMarkerSymbol,
        has
) {
    var agol = 'http://www.arcgis.com';

    var config = {
        appName: 'daq-web',
        appId: 'Rngn0PfKFjvT2p26',
        version: '1.1.1',
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
            webapi: 'http://localhost/daq',
            webMap: '6ad68af1ab6349579cc0af364b49dccd',
            agol: agol + '/sharing',
            agolHome: agol
        },
        symbols: {
            point: new SimpleMarkerSymbol({
                color: [177, 13, 201, 200], // eslint-disable-line no-magic-numbers
                size: 7.5,
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                type: 'esriSMS',
                style: 'esriSMSCircle',
                outline: {
                    color: [0, 31, 63, 255], // eslint-disable-line no-magic-numbers
                    width: 0.5,
                    type: 'esriSLS',
                    style: 'esriSLSSolid'
                }
            }),
            line: {},
            poly: {}
        }
    };

    if (has('agrc-build') === 'prod' || has('agrc-build') === 'stage') {
        config.urls.webapi = '/daq';
    }

    return config;
});
