require([
    'app/Buffer',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/Buffer', function () {
        var widget;
        var destroy = function (w) {
            w.destroyRecursive();
            w = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a Buffer', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});
