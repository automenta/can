// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate = true, _context = null) {
    var timeout;
    return function() {
        const context = _context ? _context : this, args = arguments;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function throttle(fn, threshhold, scope) {
    var last,
        deferTimer;
    return ()=>{
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(()=>{
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}

function isDOM(x) { return typeof x === "object" && x.ELEMENT_NODE /* HACK find better way of testing DOM element instances */ }
function isHTMLish(s) {
    return typeof s === "string" && s.startsWith('<') && s.endsWith('>'); //TODO better HTML detection
}