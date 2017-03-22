define([
    './config',
    './ToggleButtonStatus',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/request/xhr',
    'dojo/text!app/templates/ExternalFileManager.html',
    'dojo/topic',
    'dojo/_base/declare'
], function (
    config,
    ToggleButtonStatus,

    _TemplatedMixin,
    _WidgetBase,

    xhr,
    template,
    topic,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      manage external file uploads and deletes
        templateString: template,
        baseClass: 'external-file-manager',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.info('app/ExternalFileManager:postCreate', arguments);

            // this.setupConnections();

            this.inherited(arguments);
        },
        // setupConnections: function () {
        //     // summary:
        //     //      wire events, and such
        //     console.info('app/ExternalFileManager:setupConnections', arguments);
        //
        // },
        addExternal: function (event) {
            // summary:
            //      description
            // param or return
            console.info('app/ExternalFileManager:addExternal', arguments);

            var clicked = event.target;

            ToggleButtonStatus.toggle(clicked, {
                buttonText: 'processing',
                buttonCss: 'btn btn-warning',
                disabled: true
            });

            var form = new FormData(this.externalForm);
            form.append('serviceUrl', this.props.url);
            form.append('featureId', this.props.graphic.attributes[config.fields.uniqueId]);

            xhr(config.urls.webapi + '/upload/external', {
                method: 'post',
                data: form,
                headers: {
                    'X-Requested-With': null
                },
                handleAs: 'json'
            }).then(function (json) {
                if (json.error) {
                    topic.publish(config.topics.toast, {
                        message: json.error.messages || 'something went wrong',
                        type: 'danger'
                    });

                    ToggleButtonStatus.toggle(clicked, {
                        buttonText: 'error, try again?',
                        buttonCss: 'btn btn-danger',
                        disabled: false
                    });

                    return;
                }

                ToggleButtonStatus.toggle(clicked, {
                    buttonText: 'attach',
                    buttonCss: 'btn btn-default',
                    disabled: false
                });

                topic.publish(config.topics.toast, {
                    message: 'file saved successfully!',
                    type: 'success'
                });

                this.externalForm.reset();
            }.bind(this), function (error) {
                ToggleButtonStatus.toggle(clicked, {
                    buttonText: 'error, try again?',
                    buttonCss: 'btn btn-danger',
                    disabled: false
                });

                topic.publish(config.topics.toast, {
                    message: error,
                    type: 'danger'
                });
            });
        }
    });
});
