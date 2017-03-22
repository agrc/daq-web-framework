define([], function () {
    return {
        toggle: function (node, options) {
            // summary:
            //      toggle css and status of buttons
            // node: domnode to act on
            // options: {
            //     buttonText: what the button should say,
            //     buttonCss: what to change the css to,
            //     disabled: boolean
            // }
            console.info('app/ToggleButtonStatus:toggle', arguments);

            // invert css and button text depending
            node.className = options.buttonCss;
            if (node.tagName === 'BUTTON') {
                node.innerHTML = options.buttonText;
            } else {
                node.setAttribute('value', options.buttonText);
            }

            if (options.disabled) {
                node.setAttribute('disabled', 'disabled');
            } else {
                node.removeAttribute('disabled');
            }
        }
    };
});
