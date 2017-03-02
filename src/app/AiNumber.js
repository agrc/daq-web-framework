define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/on',
    'dojo/request/xhr',
    'dojo/text!app/templates/AiNumber.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    domAttr,
    domClass,
    on,
    xhr,
    template,
    topic,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Adds the ai number to a record in arcgis online
        templateString: template,
        baseClass: 'ai-number',
        feature: 2,
        url: '',

        // Properties to be sent into constructor
        token: null,

        constructor: function (props) {
            // summary:
            //      constructor
            //
            console.log('app/AiNumber:constructor', arguments);

            this.props = props;
            this.feature = props.graphic.attributes[config.fields.uniqueId];
            this.url = props.url;
        },
        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/AiNumber::postCreate', arguments);

            if (this.props.graphic.attributes[config.fields.lock]) {
                domClass.add(this.createNode, 'hidden');
            } else {
                domClass.add(this.updateNode, 'hidden');
            }

            this.setupConnections();

            this.inherited(arguments);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.info('app/AiNumber::setupConnections', arguments);

            this.own(
                on(this.toggleUpdate, 'click', lang.hitch(this, this._showCreate)),
                on(this.ai, ['change, keyup, input'].join(), lang.hitch(this, this.validate))
            );
        },
        update: function () {
            // summary:
            //      sends the request to update the ai number in agol
            // param or return
            console.log('app/AiNumber:update', arguments);

            domAttr.set(this.submit, 'disabled', true);
            var attributes = {};
            attributes[config.fields.uniqueId] = this.feature;
            attributes[config.fields.lock] = this.ai.value;

            xhr(this.url + '/updateFeatures', {
                method: 'POST',
                handleAs: 'json',
                headers: {
                    'X-Requested-With': null
                },
                data: {
                    features: JSON.stringify([{
                        attributes: attributes
                    }]),
                    rollbackOnFailure: true,
                    token: this.token,
                    f: 'json'
                }
            }).then(lang.hitch(this, function (data) {
                if ('updateResults' in data) {
                    if (data.updateResults[0].success) {
                        this.props.aiNumber =
                        this.props.graphic.attributes[config.fields.lock] =
                            this.ai.value;
                        topic.publish(config.topics.addAi, this.props);
                    } else {
                        domAttr.remove(this.submit, 'disabled');
                        topic.publish(config.topics.toast, data.updateResults[0].error.description);
                    }
                } else {
                    domAttr.remove(this.submit, 'disabled');
                    topic.publish(config.topics.toast, data.error);
                }
            }), function (err) {
                domAttr.remove(this.submit, 'disabled');
                topic.publish(config.topics.toast, err);
            });
        },
        validate: function () {
            // summary:
            //      enable the ai number button
            // param or return
            console.log('app/AiNumber:validate', arguments);

            if (this.ai.value.length > 0) {
                domAttr.remove(this.submit, 'disabled');

                return;
            }

            domAttr.set(this.submit, 'disabled', true);
        },
        _showCreate: function () {
            // summary:
            //      hides the update and shows the create ai form-group
            // none
            console.log('app/AiNumber:_showCreate', arguments);

            domClass.add(this.updateNode, 'hidden');
            domClass.remove(this.createNode, 'hidden');
        }
    });
});
