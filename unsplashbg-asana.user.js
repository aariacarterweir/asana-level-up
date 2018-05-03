// ==UserScript==
// @name        unsplashbg-asana
// @description Background from unsplash.com as background in asana.
// @author      Ariana Carter-Weir
// @namespace   unsplashbg-asana
// @include     https://app.asana.com/*
// @version     3.1.2
// @grant GM_xmlhttpRequest
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @run-at document-ready
// ==/UserScript==

/** Change Log
 * - Added user configurable search terms saved in localstorage
 */

// namespace
var unsplashbg = {
    options: {
        interval: 120 * 1000, // (seconds) * 1000
        size: '1920x1080',
        transitionDuration : '2s',

        // no trailing slash on the path pls
        // path: 'random'

        // ari's LA collection
        //path: 'collection/1266904'

        // generic Welcome to LA collection
        //path: 'collection/1171747',

        path: '',

        pathDefault: 'no-path',

        // comma separated search terms
        searchTermDefault: 'nautical, boat, sea, sunset',

        // search term
        // to disable search term, set to 'no-search-term'
        searchTerm: ''
    }
};


unsplashbg.userSearchTerm = function(reset) {
    var keys = {
        searchTerm: 'unsplash-search-term',
        path: 'unsplash-path'
    };

    for (var type in keys) {
        if (!localStorage.getItem(keys[type]) || reset === true) {
            switch(type) {
                case 'searchTerm':
                    localStorage.setItem(keys[type], prompt("Enter your search term for unsplash or leave blank to use the default. Set to 'no-search-term' to disable the search term. " +
                        "Search terms are separated by commas. Default: " + unsplashbg.options.searchTermDefault) || unsplashbg.options.searchTermDefault);
                    break;

                case 'path':
                    localStorage.setItem(keys[type], prompt("Enter your path for unsplash or leave blank to use the default. " +
                        "No trailing or preceding slashes please! Eg: 'collection/1266904' Default: '" + unsplashbg.options.pathDefault + "'") || unsplashbg.options.pathDefault);
                    break;
            }
        }

        unsplashbg.options[type] = localStorage.getItem(keys[type]);
    }

    if (reset === true) {
        unsplashbg.changeBg();
    }
};

unsplashbg.styles = [];

// change bg fn
unsplashbg.changeBg = function() {
    clearInterval(unsplashbg.timer);

    var url = 'https://source.unsplash.com/';

    if (unsplashbg.options.path && unsplashbg.options.path !== 'no-path') {
        url += unsplashbg.options.path + '/';
    }

    if (unsplashbg.options.size) {
        url+= unsplashbg.options.size + '/';
    }

    if (unsplashbg.options.searchTerm && unsplashbg.options.searchTerm !== 'no-search-term') {
        url += '?' + encodeURI(unsplashbg.options.searchTerm)
    }

    GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0', // If not specified, navigator.userAgent will be used.
            'Accept': 'text/xml' // If not specified, browser defaults will be used.
        },

        onload: function (response) {

            var tmp = new Image();

            tmp.onload = function(){
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

                // Add in the link if necessary
                if (!$('.unsplash-link').length) {
                    $('<a href="" class="unsplash-link" target="_blank">&#128247;</a>').appendTo($('body'));
                }

                // Update link with url to image
                $('.unsplash-link').attr('href', response.finalUrl);
            };

            tmp.src = response.finalUrl;
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

    'body, #bg_pattern { ' +
        // enhance performance
        '-webkit-backface-visibility: hidden;   -moz-backface-visibility: hidden;   -ms-backface-visibility: hidden; ' +
        'backface-visibility: hidden; ' +

        // layout
        'background-position: center center; ' +
        'background-size: cover; ' +
        'background-repeat: no-repeat;' +
        '-webkit-transition: background-image ' + unsplashbg.options.transitionDuration + ' ease-in-out; ' +
        'transition: background-image ' + unsplashbg.options.transitionDuration + ' ease-in-out; ' +
    '}' +

    '.Sidebar { background-color: rgba(34, 43, 55, 0.9) !important; }' +
    '.SingleTaskTitleRow-taskName textarea, .Tokenizer { background: transparent !important; } ' +

    'span.BoardColumnHeaderTitle {\n' +
    '    background: rgba(255,255,255,0.7);\n' +
    '    border-radius: 10px;\n' +
    '    padding: 0 20px;\n' +
    '}' +

    '.BoardBody-descriptionLink {\n' +
    '    background: rgba(255,255,255,0.4);\n' +
    '    color: #000;\n' +
    '    padding: 0 5px;\n' +
    '}' +

    'a.BoardBody-descriptionLink {\n' +
    '    color: #000;\n' +
    '}' +

    '.FloatingSelect-label {\n' +
    '    background: rgba(255,255,255,0.4);\n' +
    '    color: #000;\n' +
    '    padding: 0 5px;\n' +
    '}' +

    // unsplash icon
    '.unsplash-link { text-decoration: none; position: absolute; bottom: 10px; left: 20px; font-size: 18px; opacity: 0.7; } ' +
    '.unsplash-link:hover, .unsplash-link:active, .unsplash-link:visited, .unsplash-link:focus { text-decoration: none; opacity: 1; }';
document.head.appendChild(unsplashbg.basestyles);

// call the fns
unsplashbg.userSearchTerm();
unsplashbg.changeBg();

// register a key binding
$(document).bind('keydown', function(e){
    if(e.ctrlKey && e.shiftKey && e.which === 190) {
        return unsplashbg.changeBg();
    }

    if (e.ctrlKey && e.shiftKey && e.which === 188) {
        unsplashbg.userSearchTerm(true);
    }
});

console.log('--------------------');
console.log('UnsplashBG running');
console.log('Press CTRL+SHIFT+. to change bg');
console.log('Press CTRL+SHIFT+, to change search terms / path');
console.log('BG will change every ' + unsplashbg.options.interval / 1000 + ' seconds');
console.log('Use the camera icon in the bottom left of the window to view the image directly :)');
console.log('--------------------');