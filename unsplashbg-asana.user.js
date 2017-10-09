// ==UserScript==
// @name        unsplashbg-asana
// @description Background from unsplash.com as background in asana.
// @author      Ariana Carter-Weir
// @namespace   unsplashbg-asana
// @include     https://app.asana.com/*
// @version     2.4
// @grant GM_xmlhttpRequest
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @run-at document-ready
// ==/UserScript==

// namespace
var unsplashbg = {
    options: {
        interval: 30 * 1000, // (seconds) * 1000
        size: '1920x1080',
        transitionDuration : '2s',
        path: 'collection/1266904' // no trailing slash pls
    }
};

unsplashbg.styles = [];

// change bg fn
unsplashbg.changeBg = function() {
    clearInterval(unsplashbg.timer);

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://source.unsplash.com/' + unsplashbg.options.path + '/' + unsplashbg.options.size,
        headers: {
            'User-Agent': 'Mozilla/5.0', // If not specified, navigator.userAgent will be used.
            'Accept': 'text/xml' // If not specified, browser defaults will be used.
        },
        onload: function (response) {
            // create new style
            var DLstyle = document.createElement("style");
            DLstyle.textContent = ' body, #bg_pattern ' +
                '{' +
                'background-image: url("'+ response.finalUrl +'") !important; ' +
                '}';
            document.head.appendChild(DLstyle);
            unsplashbg.styles.push(DLstyle);

            var oldStyle;
            if ( (oldStyle = unsplashbg.styles[unsplashbg.styles.length - 2]) ) {
                // cleanup later...
                setTimeout(function(){
                    oldStyle.outerHTML = '';
                }, 20000);
            }

            // kick off another timer
            unsplashbg.timer = setInterval(unsplashbg.changeBg, unsplashbg.options.interval);
        }
    });
};


// add generic styles to doc
unsplashbg.basestyles = document.createElement("style");
unsplashbg.basestyles.textContent = 'body .lunaui-grid-center-pane-container #center_pane, ' +
    'body .lunaui-grid-center-pane-container #right_pane, ' +
    'body #right_pane_container #center_pane, ' +
    'body #right_pane_container #right_pane, ' +
    '.asana2View-taskPane ' +
    '{' +
    'background-color: rgba(255,255,255,0.955); '+
    '}' +

    '#bg_pattern { ' +
    // enhance performance
    '-webkit-backface-visibility: hidden;   -moz-backface-visibility: hidden;   -ms-backface-visibility: hidden; ' +
    'backface-visibility: hidden; -webkit-transform: translateZ(0); ' +

    // layout
    'background-position: center center; ' +
    'background-size: cover; ' +
    'background-repeat: no-repeat;' +
    '-webkit-transition: background-image ' + unsplashbg.options.transitionDuration + ' ease-in-out; ' +
    'transition: background-image ' + unsplashbg.options.transitionDuration + ' ease-in-out; ' +
    '}' +

    '.Sidebar { background-color: rgba(34, 43, 55, 0.9) !important; }' +
    '.SingleTaskTitleRow-taskName textarea, .Tokenizer { background: transparent !important; }';
document.head.appendChild(unsplashbg.basestyles);

// call the fn
unsplashbg.changeBg();

// register a key binding
$(document).bind('keydown', function(e){
    if(e.ctrlKey && e.shiftKey && e.which === 190) {
        unsplashbg.changeBg();
    }
});