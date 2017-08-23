// ==UserScript==
// @name        unsplashbg-asana
// @description Background from unsplash.com as background in asana.
// @author      Ariana Carter-Weir
// @namespace   unsplashbg-asana
// @include     https://app.asana.com/*
// @version     1.0
// @grant GM_xmlhttpRequest
// @run-at document-ready
// ==/UserScript==

// namespace
var unsplashbg = {
    options: {
        interval: 60 * 1000 // (seconds) * 1000
    }
};

// change bg fn
unsplashbg.changeBg = function() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://source.unsplash.com/random/1000x562',
      headers: {
        'User-Agent': 'Mozilla/5.0', // If not specified, navigator.userAgent will be used.
        'Accept': 'text/xml' // If not specified, browser defaults will be used.
      },
      onload: function (response) {
        // delete previous style
        if (document.getElementById('unsplashbg-style')) {
            document.getElementById('unsplashbg-style').outerHTML='';
        }

        // create new style
        var DLstyle = document.createElement("style");
            DLstyle.setAttribute("id", "unsplashbg-style");
            DLstyle.textContent = ' body, #bg_pattern ' +
                '{' +
                    'background-image: url("'+ response.finalUrl +'") !important; ' +
                    'background-position: top center; ' +
                    'background-size: cover; ' +
                    'background-repeat: no-repeat;' +
                '}';
            document.head.appendChild(DLstyle);
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

                                    '.SingleTaskTitleRow-taskName textarea, ' +
                                    '.Tokenizer' +
                                    '{' +
                                        'background: transparent !important;' +
                                    '}';
document.head.appendChild(unsplashbg.basestyles);

// call the fn
unsplashbg.changeBg();

// set up an interval
unsplashbg.interval = setInterval(unsplashbg.changeBg, unsplashbg.options.interval);