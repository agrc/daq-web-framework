(function () {
    require({ baseUrl: './content/' }, ['dojo/parser', 'jquery', 'dojo/domReady!'], function (parser) {
        parser.parse();
    });
}());
