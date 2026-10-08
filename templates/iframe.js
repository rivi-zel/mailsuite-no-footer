/* El código a continuación es propiedad intelectual de The Mail Track Company S.L. de Barcelona y es secreto industrial.

The code hereafter is the intellectual property of The Mail Track Company S.L. of Barcelona, Spain and is a Trade Secret. */
(function() {
    'use strict';

    var ALLOWED_IFRAME_HOSTS = [
        'mailtrack.io',
        'mailtrack.me',
        'mailsuite.com',
        'mailsuite.me',
        'maildoc.io',
        'maildoc.me',
    ];

    var ALLOWED_IFRAME_HOST_PATTERNS = ALLOWED_IFRAME_HOSTS.map(function(allowedHost) {
        var escapedHost = allowedHost.replace(/\./g, '\\.');
        return new RegExp('^(?:.+\\.)?' + escapedHost + '$');
    });

    var isAllowedHost = function(url) {
        try {
            var parsed = new URL(url);
            if (parsed.protocol !== 'https:') {
                return false;
            }
            return ALLOWED_IFRAME_HOST_PATTERNS.some(function(pattern) {
                return pattern.test(parsed.hostname);
            });
        } catch (e) {
            return false;
        }
    };

    var iframe = document.getElementById('iframe');
    var postClose = function() {
        window.parent.postMessage(
            {
                // Forward message
                action: 'close',
            },
            '*'
        );
    };
    /**
     * Wait so popup can appear in context.
     */
    var iframeError = setTimeout(function() {
        postClose();
    }, 10000);

    /**
     * Listens to messages sent from s3 src page.
     */
    window.addEventListener(
        'message',
        function receiveMessage(event) {

            if (/^https:\/\/mail\.google\.com$/.test(event.origin)) {
                if (event.data?.type === 'login') {
                    iframe.contentWindow.postMessage({...event.data}, '*');
                }
            }

            if (isAllowedHost(event.origin)) {
                if (event.data.action === 'loaded') {
                    clearTimeout(iframeError);
                }

                window.parent.postMessage(
                    {
                        action: event.data.action,
                        size: event.data.size,
                    },
                    '*'
                );
            }
        },
        false
    );

    var rawUrl = decodeURIComponent(
        window.location.search.replace('?url=', '') + window.location.hash
    );

    if (!isAllowedHost(rawUrl)) {
        clearTimeout(iframeError);
        postClose();
        return;
    }

    iframe.src = rawUrl;

    iframe.addEventListener(
        'error',
        function() {
            clearTimeout(iframeError);
            postClose();
        },
        false
    );

    iframe.addEventListener('load' , function() {
        iframe.style.display = 'block';
    })
})();
