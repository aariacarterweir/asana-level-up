// ==UserScript==
// @name        asana-level-up
// @description Adds background images from unsplash, customisable My Tasks sections and more!
// @author      Aaria Carter-Weir
// @namespace   asana-level-up
// @include     https://app.asana.com/*
// @version     5.2.4
// @grant GM_xmlhttpRequest
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.js
// @run-at document-ready
// ==/UserScript==

(function() {
    // Used for localStorage etc
    var namespace = 'asana-level-up',
        defaults, configurable, Plugin;

    // Default options which can be over-written:
    defaults = {
        bgEnabled: true,
        bgInterval: 60, // seconds
        bgSize: '1920x1080',
        bgTransition: '2s',
        bgSearchTerm: 'beach, beach sunrise, water',

        "label New Tasks"   : "In Tray",
        "label Today"       : "Next Actions",
        "label Upcoming"    : "Upcoming Actions",
        "label Later"       : "My Outcomes & Projects",
    };

    /** Configurable Options **/
    configurable = {
        heading_bg: "Background Image",

            bgEnabled: {
            label: "Status",
                field: {
                Enabled: true,
                    Disabled: false
            }
        },

        bgInterval: {
            label: "Interval (seconds)",
                field: "number"
        },

        bgSearchTerm: {
            label: "Unsplash Search Terms (comma separated)",
                field: "text"
        },

        heading_mytasks: "My Tasks Headings",

            "label New Tasks": {
            label: "Rename 'New Tasks' To",
                field: "text"
        },

        "label Today": {
            label: "Rename 'Today' To",
                field: "text"
        },

        "label Upcoming": {
            label: "Rename 'Upcoming' To",
                field: "text"
        },

        "label Later": {
            label: "Rename 'Later' To",
                field: "text"
        }
    };

    // Plugin constructor
    Plugin = function () {
        this.options = $.extend(true, {}, defaults, this.loadUserOptions());

        this.props = {
            currentBgUrl: null,
            bgTimer: null,
            timers: []
        };

        this.waitForElement('.react-app-node, .asana2View-bodyContainer', function() {
            this.buildUI();
            this.run();
        }, { attempts: 0 });
    };

    // Plugin methods
    Plugin.prototype = {
        run: function() {
            this.initBG();
            //this.initMyTasks();
        },

        initBG: function() {
            this.options.bgEnabled = (this.options.bgEnabled === true || this.options.bgEnabled === "true");

            if (this.options.bgEnabled) {
                // turn on the BG image
                this.$_bgCss.appendTo('head');
                this.$_bgImage.appendTo('head');
                this.changeBG();
                $('[href="#openBG"], [href="#changeBG"]', this.$_controls).show();

                return;
            }

            // turn off the BG image
            this.$_bgImage.detach();
            this.$_bgCss.detach();
            this.props.currentBgUrl = null;
            clearInterval(this.props.bgTimer);
            $('[href="#openBG"], [href="#changeBG"]', this.$_controls).hide();
        },

        initMyTasks: function() {
            var self = this,
                mtEvent, mtMenuEvent, mtTooltipEvent;

            this.waitForElement('.NavigationLink.Topbar-myTasksButton', function($_element) {
                if ($_element.hasClass('is-selected')) {
                    this.updateMyTasks();
                }
            }, { interval: 500, attempts: 0 });

            mtEvent = 'click.mytasks_' + namespace;
            mtMenuEvent = 'click.mytasksMenu_' + namespace;
            mtTooltipEvent = 'mouseenter.mytasks_' + namespace;

            $(document).off(mtEvent).on(mtEvent, '.NavigationLink.Topbar-myTasksButton', function() {
                self.updateMyTasks();
            });

            $(document).off(mtMenuEvent).on(mtMenuEvent, '.ScheduleStatus.MyTasksTaskRow-scheduleStatus', function() {
                self.updateMyTasksMenu();
            });

            $(document).off(mtTooltipEvent).on(mtTooltipEvent, '.ScheduleStatus.MyTasksTaskRow-scheduleStatus', function() {
                self.waitForElement('div.Tooltip-body', function($_element) {
                    $_element.html('Mark this task for ' + this.options["label Today"] + ', ' + this.options["label Upcoming"] + ' or ' + this.options["label Later"] + '.');
                }, { attempts: 11 });
            });
        },

        updateMyTasks: function() {
            var selector = '.TaskGroup-subgroups .TaskGroup .TaskGroupHeader>span.TaskGroupHeader-content',
                self = this;

            this.waitForElement(selector, function($_headings) {
                $_headings.each(function () {
                    var $_element = $(this),
                        dataKey = 'origText_' + namespace;

                    if (!$_element.data(dataKey)) {
                        $_element.data(dataKey, $_element.text());
                    }

                    var label = "label " + $_element.data(dataKey);

                    if (self.options[label]) {
                        var $_div = $_element.find('div').detach();
                        $_element.html(self.options[label]).prepend($_div);
                    }
                });
            }, { numElements: 4 });
        },

        updateMyTasksMenu: function() {
            var selector = '.menu.menu--select.ScheduleStatusPopover-menu a.menuItem-button span.ScheduleStatusPopover-mainText',
                self = this;

            this.waitForElement(selector, function($_items) {
                $_items.each(function() {
                    var $_element = $(this),
                        dataKey = 'origText_' + namespace;

                    if (!$_element.data(dataKey)) {
                        $_element.data(dataKey, $_element.text().replace(/^Mark(ed)? for /, ''));
                    }

                    var label = "label " + $_element.data(dataKey);

                    if (self.options[label]) {
                        $_element.text($_element.text().replace(/^(Mark(?:ed)? for) .+$/, '$1 ' + self.options[label]));
                    }
                });
            }, { numElements: 3 });
        },

        buildUI: function() {
            this.buildCSS();
            this.buildControls();
            this.buildSettings();
        },

        buildControls: function() {
            var self = this;

            this.$_controls = $('<div class="controls_' + namespace + '"></div>').appendTo('body');

            // # Add Buttons
            $(
                // Settings Button
                '<a href="#openSettings"><i class="fa fa-cog"></i></a>' +
                // Open BG Button
                '<a href="#openBG"><i class="fa fa-camera-retro"></i></a>' +
                // Change the BG Button
                '<a href="#changeBG"><i class="fa fa-refresh"></i></a>'
            ).appendTo(this.$_controls);

            // # Bind Buttons
            $('a', this.$_controls).bind('click', function(e) {
                e.preventDefault();

                var action = $(this).attr('href').replace(/^#/, '');
                self[action].call(self);
            });
        },

        openBG: function() {
            window.open(this.props.currentBgUrl);
            console.log('I OPEN BG IN NEW WINDOW? I BE GOOD DOG? WUFF!');
        },

        openSettings: function() {
            $.fancybox.open({
                src: '#settings-modal_' + namespace
            });
        },

        changeBG: function() {
            var self = this,
                url, $_buttonIcon;

            clearInterval(this.props.bgTimer);

            url = 'https://source.unsplash.com/' + this.options.bgSize + '/' +
                '?' + encodeURI(this.options.bgSearchTerm) +
                '&amp;bust-cache-timestamp=' + Math.round((new Date()).getTime() / 1000);

            // get the change BG button icon and add the loading class to it
            $_buttonIcon = $('a[href="#changeBG"] i', this.$_controls).addClass('loading-unsplash-bg');

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                headers: {
                    'User-Agent': 'Mozilla/5.0', // If not specified, navigator.userAgent will be used.
                    'Accept': 'text/xml' // If not specified, browser defaults will be used.
                },

                onload: function (response) {
                    // Preload the image
                    $('<img>').load(function() {
                        self.props.currentBgUrl = response.finalUrl;
                        $_buttonIcon.removeClass('loading-unsplash-bg');
                        self.$_bgImage.html('body, #bg_pattern { background-image: url("' + response.finalUrl + '");');
                        self.props.bgTimer = setInterval(function(){ self.changeBG(); }, self.options.bgInterval * 1000);
                    }).attr('src', response.finalUrl);
                }
            });
        },

        buildSettings: function() {
            var self = this,
                optionName,
                option,
                fieldId,
                $_select,
                label;

            this.$_settings = $('<div id="settings-modal_' + namespace + '" style="display: none;"></div>').appendTo('body');

            // loop through editable options and build settings ui for them
            for (optionName in configurable) {
                option = configurable[optionName];

                // add a heading?
                if (optionName.indexOf("heading_") === 0) {
                    $('<h3>' + option + '</h3>').appendTo(this.$_settings);
                    continue;
                }

                // store the fieldId
                fieldId = 'field-' + optionName + '_' + namespace;

                // add label
                $('<label for="' + fieldId + '"></label>').html(option.label + ":").appendTo(this.$_settings);

                // add field
                switch(typeof option.field) {
                    case 'string':
                        $('<input>')
                            .attr('type', option.field)
                            .val(this.options[optionName])
                            .attr('id', fieldId)
                            .data('option', optionName)
                            .appendTo(this.$_settings);
                        break;

                    case 'object':
                        $_select = $('<select>').attr('id', fieldId);

                        for (label in option.field) {
                            $('<option>')
                                .html(label)
                                .attr('value', option.field[label])
                                .appendTo($_select);
                        }

                        $_select
                            .val(this.options[optionName] + "")
                            .data('option', optionName)
                            .appendTo(this.$_settings);
                        break;
                }
            }

            // bind save events
            $('input, select', this.$_settings).bind('change', function() {
                var $_option = $(this),
                    option = $_option.data('option');

                if ($_option.val() === "") {
                    $_option.val(defaults[option]);
                }

                self.options[option] = $_option.val();
                self.run();
                self.saveUserOptions();
            });
        },

        buildCSS: function() {
            // add fontawesome
            $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">');
            // add flexbox
            $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.css">');

            this.$_css = $('<style></style>').appendTo('head');
            this.$_bgCss = $('<style></style>');
            this.$_bgImage = $('<style></style>');

            // add generic css
            this.$_css.html(
                // # My Tasks Menu
                'body .menu--select .menuItem-button { ' +
                    'padding-left: 20px;' +
                '} ' +

                'body .ScheduleStatusPopover-shortcut { ' +
                    'padding-left: 10px;' +
                '} ' +

                // # Controls Div
                '.controls_' + namespace + ' {' +
                    'position: absolute;' +
                    'bottom: 10px;' +
                    'left: 10px;' +
                    'font-size: 18px;' +
                    'background: rgba(0,0,0, 0.7); ' +
                    'padding: 5px 10px; ' +
                    'border-radius: 10px; ' +
                '} ' +

                '.controls_' + namespace + ' a, ' +
                '.controls_' + namespace + ' a:focus {' +
                    'opacity: 0.7;' +
                    'color: #FFF;' +
                    'margin-left: 14px;' +
                '} ' +

                '.controls_' + namespace + ' a:hover,' +
                '.controls_' + namespace + ' a:active {' +
                    'color: #FFF;' +
                    'text-decoration: none;' +
                    'opacity: 1;' +
                '} ' +

                '.controls_' + namespace + ' a:first-child { ' +
                    'margin-left: 0; ' +
                '} ' +

                // Settings
                '#settings-modal_' + namespace + ' h3 { ' +
                    'display: block; ' +
                    'margin: 40px 0 0 0; '+
                    'text-align: center; ' +
                    'font-size: 19px; ' +
                '} ' +

                '#settings-modal_' + namespace + ' h3:first-of-type { ' +
                    'margin-top: 0; ' +
                '} ' +

                '#settings-modal_' + namespace + ' label { ' +
                    'display: block; ' +
                    'margin: 20px 0 10px 0; '+
                '} ' +

                '#settings-modal_' + namespace + ' input, ' +
                '#settings-modal_' + namespace + ' select { ' +
                    'border: 1px solid #999; ' +
                    'padding: 5px; ' +
                    'width: 100%; ' +
                    'box-sizing: border-box; ' +
                '} '
            );

            this.$_bgCss.html(
                'body, #bg_pattern { ' +
                    // enhance performance
                    '-webkit-backface-visibility: hidden;   -moz-backface-visibility: hidden;   -ms-backface-visibility: hidden; ' +
                    'backface-visibility: hidden; ' +

                    // layout
                    'background-position: center center; ' +
                    'background-size: cover; ' +
                    'background-repeat: no-repeat;' +
                    '-webkit-transition: background-image ' + this.options.bgTransition + ' ease-in-out; ' +
                    'transition: background-image ' + this.options.bgTransition + ' ease-in-out; ' +
                '} ' +

                '.SingleTaskTitleRow-taskName textarea,' +
                '.Tokenizer {' +
                    'background: transparent !important;' +
                '} ' +

                'span.BoardColumnHeaderTitle {' +
                    'background: rgba(255,255,255,0.7);' +
                    'border-radius: 10px;' +
                    'padding: 0 20px;' +
                '} ' +

                '.BoardBody-descriptionLink {' +
                    'background: rgba(255,255,255,0.4);' +
                    'color: #000;' +
                    'padding: 0 5px;' +
                '} ' +

                'a.BoardBody-descriptionLink {' +
                    'color: #000;' +
                '} ' +

                '.FloatingSelect-label {' +
                    'background: rgba(255,255,255,0.4);' +
                    'color: #000;' +
                    'padding: 0 5px;' +
                '} ' +

                '.loading-unsplash-bg {' +
                    'animation: unsplashRotation 2s infinite linear;' +
                '} ' +

                '@keyframes unsplashRotation {' +
                    'from {' +
                        'transform: rotate(0deg);' +
                    '} ' +
                    'to {' +
                        'transform: rotate(359deg);' +
                    '} ' +
                '} '
            );
        },

        loadUserOptions: function() {
            var userOptions = localStorage.getItem('options_' + namespace);
            return (userOptions ? JSON.parse(userOptions) : {});
        },

        saveUserOptions: function() {
            localStorage.setItem('options_' + namespace, JSON.stringify(this.options));
        },

        waitForElement: function(selector, fn, options) {
            var self = this,
                id = this.props.timers.length,
                attempts = 0,
                stop, defaults;

            stop = function() {
                clearInterval(self.props.timers[id]);
            };

            defaults = {
                numElements: 1,
                interval: 125,
                attempts: 40
            };

            stop();
            options = $.extend({}, defaults, options);

            this.props.timers[id] = setInterval(function() {
                var $_element = $(selector);

                if ($_element.length) {
                    fn.call(self, $_element, stop);
                }

                attempts++;

                if ($_element.length >= options.numElements || (options.attempts && attempts >= options.attempts)) {
                    stop();
                }
            }, options.interval);
        }
    };

    // Assign plugin to body
    $('body').data('plugin_' + namespace, new Plugin());

})();