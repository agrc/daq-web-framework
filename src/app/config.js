define([
    'dojo/has',

    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol'
], function (
    has,

    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol
) {
    var agol = 'http://www.arcgis.com';

    var config = {
        appName: 'daq-web',
        appId: 'Rngn0PfKFjvT2p26',
        version: '1.10.1',
        maxResult: 1000,
        fields: {
            uniqueId: 'OBJECTID',
            locks: ['AI_Number', 'SITE_ID'],
            lock: null,
            operator: 'Operator_N',
            facilityId: 'facility_i'
        },
        queries: {
            well: {
                wellName: {
                    field: 'WELL_NAME',
                    type: 'string'
                },
                apiNumber: {
                    field: 'F2015_DOGM_',
                    type: 'number'
                },
                operatorName: {
                    field: 'CO_NAME',
                    type: 'string'
                }
            },
            facility: {
                facilityName: {
                    field: 'facility_n',
                    type: 'string'
                },
                operatorName: {
                    field: 'Operator_N',
                    type: 'string'
                },
                permitNumber: {
                    field: 'facility_p',
                    type: 'string'
                },
                aiNumber: {
                    field: 'AI_Number',
                    type: 'number'
                },
                inspector: {
                    field: 'Inspector',
                    type: 'string'
                }
            },
            permit: {
                facilityName: {
                    field: 'Site_Name',
                    type: 'string'
                },
                aiNumber: {
                    field: 'SITE_ID',
                    type: 'number'
                },
                permitNumber: {
                    field: 'Permit_ID',
                    type: 'string'
                }
            }
        },
        topics: {
            addAi: '1',
            toast: '2',
            graphics: {
                highlight: '3',
                clear: '4'
            },
            identify: '5',
            dirtyAssets: '6',
            removeBookmark: '7'
        },
        urls: {
            webapi: '',
            webMap: {},
            agol: agol + '/sharing',
            agolHome: agol
        },
        symbols: {
            point: new SimpleMarkerSymbol({
                color: [1, 255, 12, 200], // eslint-disable-line no-magic-numbers
                size: 25,
                angle: 0,
                xoffset: 0,
                yoffset: 0,
                type: 'esriSMS',
                style: 'esriSMSCircle',
                outline: {
                    color: [255, 220, 0, 255], // eslint-disable-line no-magic-numbers
                    width: 2,
                    type: 'esriSLS',
                    style: 'esriSLSSolid'
                }
            }),
            line: {},
            poly: new SimpleFillSymbol({
                color: [240, 28, 190, 200], // eslint-disable-line no-magic-numbers
                outline: {
                    color: [0, 31, 63, 255], // eslint-disable-line no-magic-numbers
                    width: 0.5,
                    type: 'esriSLS',
                    style: 'esriSLSSolid'
                },
                type: 'esriSFS',
                style: 'esriSFSSolid'
            }),
            trs: new SimpleFillSymbol({
                color: [0, 0, 0, 64], // eslint-disable-line no-magic-numbers
                outline: {
                    color: [255, 65, 54, 200], // eslint-disable-line no-magic-numbers
                    width: 3,
                    type: 'esriSLS',
                    style: 'esriSLSShortDot'
                },
                type: 'esriSFS',
                style: 'esriSFSNull'
            })
        }
    };

    if (has('agrc-build') === 'prod') {
        config.urls.webMap = {
            desktop: '82390d3787af4ae98585f90ccea08485',
            collector: 'bf8154cbecb24ea4916580c185277590'
        };
        config.apiKey = 'AGRC-4D020FEF882975';
    } else if (has('agrc-build') === 'stage') {
        config.urls.webMap = {
            desktop: '54525aa512544213adf194303769b643',
            collector: 'df8947f4217149cabed0f346c8f53742'
        };
        config.urls.webapi = '/daq';
        config.apiKey = 'AGRC-AC122FA9671436';
    } else {
        config.urls.webMap = {
            desktop: '54525aa512544213adf194303769b643',
            collector: 'df8947f4217149cabed0f346c8f53742'
        };
        config.urls.webapi = 'http://localhost/daq';
        config.apiKey = 'AGRC-E5B94F99865799';
    }

    return config;
});
