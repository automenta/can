function terminal() {
    const term = $('#term');
    const termStyle = term[0].style;


    var focused = false;
    const _focusUpdate = () => {
        if (focused) {
            //termStyle.transform = 'scale(1)';
            termStyle.zoom = 2;
            termStyle.opacity = 0.9;
            termStyle.width = "25%";
            termStyle.pointerEvents = 'all';
            termStyle.backgroundColor = 'black';
        } else {
            termStyle.zoom = 0.6;
            //termStyle.transform = 'scale(0.5)';
            termStyle.opacity = 0.5;
            termStyle.width = "80px";
            termStyle.pointerEvents = 'none';
            termStyle.backgroundColor = 'transparent';
        }
    };
    const motionFocus = e => {
        if (e.originalEvent.pageX < 80) { //HACK TODO Use some comparison with actual terminal screen position
            term.focus();
            //hovering = true;
        } else {
            //hovering = false;
        }
    };
    $('body').mousemove(motionFocus);

    const focusUpdate = throttle(_focusUpdate, 500);
    term.focusin(() => {
        focused = true;
        _focusUpdate();
    });
    term.focusout(() => {
        focused = false;
        focusUpdate();
    });


    jQuery(function ($, undefined) {
        /*$.terminal.defaults.formatters.push(
            $.terminal.prism.bind(null, 'javascript')
        );*/
        term.terminal(function (command) {
            if (command !== '') {
                try {
                    var result = window.eval(command);
                    if (result !== undefined) {
                        this.echo(new String(result));
                    }
                } catch (e) {
                    this.error(new String(e));
                }
            } else {
                this.echo('');
            }
        }, {
            greetings: null,
            name: 'js_demo',
            height: '100%',
            width: '25%',
            prompt: '▒ ',
            invokeMethods: true
        });
    });
}