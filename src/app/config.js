define([
    'dojo/has',

    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleMarkerSymbol'
], function (
    has,

    SimpleFillSymbol,
    SimpleMarkerSymbol
) {
    var agol = 'http://www.arcgis.com';

    var config = {
        appName: 'daq-web',
        appId: 'Rngn0PfKFjvT2p26',
        version: '1.4.2',
        maxResult: 1000,
        fields: {
            uniqueId: 'OBJECTID',
            lock: 'AI_Number',
            queryOne: 'CO_NAME',
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
                },
                wellType: {
                    field: 'Assigned_T',
                    type: 'string'
                },
                jurisdiction: {
                    field: 'Juris',
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
                jurisdiction: {
                    field: 'facility_j',
                    type: 'string'
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
            identify: '5'
        },
        urls: {
            webapi: 'http://localhost/daq',
            webMap: '54525aa512544213adf194303769b643',
            agol: agol + '/sharing',
            agolHome: agol
        },
        symbols: {
            point: new SimpleMarkerSymbol({
                color: [1, 255, 12, 200], // eslint-disable-line no-magic-numbers
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
            })
        }
    };

    if (has('agrc-build') === 'prod' || has('agrc-build') === 'stage') {
        config.urls.webapi = '/daq';
        config.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        config.apiKey = 'AGRC-E5B94F99865799';
    }

    return config;
});
