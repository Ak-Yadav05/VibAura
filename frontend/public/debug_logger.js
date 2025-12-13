(function () {
    const logDiv = document.createElement('div');
    logDiv.id = 'debug-log';
    logDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:50%;background:rgba(0,0,0,0.8);color:lime;font-family:monospace;white-space:pre-wrap;overflow:auto;z-index:99999;padding:10px;pointer-events:none;';
    document.body.appendChild(logDiv);

    function log(msg) {
        logDiv.textContent += msg + '\n';
    }

    const origLog = console.log;
    console.log = function (...args) {
        log('[LOG] ' + args.join(' '));
        origLog.apply(console, args);
    };

    const origErr = console.error;
    console.error = function (...args) {
        log('[ERR] ' + args.join(' '));
        origErr.apply(console, args);
    }

    window.addEventListener('error', function (e) {
        log('[Uncaught] ' + e.message + ' at ' + e.filename + ':' + e.lineno);
    });

    window.addEventListener('unhandledrejection', function (e) {
        log('[Unhandled Rejection] ' + e.reason);
    });

    log('Debug logger initialized.');
})();
