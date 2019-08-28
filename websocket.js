function websocketTest(url) {
    var ws = new ReconnectingWebSocket(url);
    const channel = ws.url;
    var mid = 0;
    //ws.debug = true;
    //TODO handle error messages, displaying them in a div in the widget

    ws.onmessage = (e) => {
        //https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
        const y = JSON.parse(e.data, null);
        a.put(channel + '_' + (mid++), y);
    };
    ws.onopen = () => {
        setTimeout(() => ws.send('x.getClass()'), 2000);
        setTimeout(() => ws.send('1+1'), 2500);
    };

    const inputBox = $("<div contenteditable='true' style='background-color:black; color:orange; width:100%; height:100%'/>");//<button>?</button><textarea cols='25' rows='3'></textarea>").wrap('div')
    inputBox.keypress((k) => {
        if (k.keyCode === 13 /* enter */) {
            const i = inputBox.text();
            console.log(i);
            inputBox.text(''); //clear
            ws.send(i);
            k.stopPropagation();
        }
    });

    return $('<div>').append($('<code>' + ws.url + '</code>'), inputBox)[0];
}

