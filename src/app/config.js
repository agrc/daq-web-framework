define([], function () {
    var agol = 'http://utah.maps.arcgis.com';

    return {
        appName: 'daq-web',
        appId: 'Uri0b5yIFpHSFulo',
        version: '1.0.0',
        fields: {
            uniqueId: 'FID',
            lock: 'AiNumber',
            queryOne: 'COMPANY_NA'
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
            webMap: '4bc934d83b3d46609d56b9778541256c',
            agol: agol + '/sharing',
            agolHome: agol
        },
        symbols: {
            point: {},
            line: {},
            poly: {}
        }
    };
});
