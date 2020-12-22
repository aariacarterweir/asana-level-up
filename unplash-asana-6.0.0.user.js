// ==UserScript==
// @name        asana-level-up-v6
// @description Adds background images from unsplash, customisable My Tasks sections and more!
// @author      Aaria Carter-Weir
// @namespace   asana-level-up
// @include     https://app.asana.com/*
// @version     6.0.0
// @grant GM_xmlhttpRequest
// @require https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js
// @run-at document-ready
// ==/UserScript==

class AsanaLevelUp {
    constructor() {
        this.options = _.merge({
            bgEnabled: true,
            bgInterval: 60, // seconds
            bgSize: '1875x1406',
            bgSearchTerm: 'surf',
        }, localStorage.getItem('options_asana_level-up') || {});

        this.mutationHandlers = [];

        this.settings = new Settings(this.options, this.mutationHandlers);
        this.bg = new Bg(this.options, this.mutationHandlers);

        this.observe();
    }

    observe() {
        const observer = new MutationObserver(_.debounce(() => _.each(this.mutationHandlers, handler => handler()), 50));
        observer.observe(document.querySelectorAll('.AppRoot')[0], {
            childList: true,
            attributes: false,
            subtree: true,
        });
    }
}

class Settings {
    constructor(options, mutationHandlers) {
        this.options = options;
        this.mutationHandlers = mutationHandlers;
        this.boot();
    }

    boot() {
        this.mutationHandlers.push(() => this.mutate());
    }

    mutate() {
        const menu = document.querySelectorAll('.TopbarPageHeaderGlobalActions-settingsDropdown .Menu')[0];

        if (! menu || menu.querySelectorAll('.AsanaLevelUpSettingsButton').length) {
            return;
        }

        const sep = document.createElement('div');
        sep.classList.add('MenuSeparator');
        menu.appendChild(sep);

        const button = document.createElement('a');
        button.classList.add('StaticMenuItemBase-button', 'StaticMenuItemBase--medium', 'MenuItemBase', 'Menu-menuItem', 'AsanaLevelUpSettingsButton');
        button.innerHTML = `<span class="MenuItem-label">Level.up Settings</span>`;
        menu.appendChild(button);

        button.addEventListener('mouseenter', () => {
            _.each(menu.querySelectorAll('.is-highlighted'), node => node.classList.remove('is-highlighted'));
            button.classList.add('is-highlighted');
        });

        button.addEventListener('mouseleave', () => {
            button.classList.remove('is-highlighted');
        });
    }
}

class Bg {
    constructor(options, mutationHandlers) {
        this.options = options;
        this.mutationHandlers = mutationHandlers;
        this.boot();
    }

    boot() {
        if (this.options.bgEnabled && ! this.bgTimer) {
            this.updateBg();
            this.bgTimer = setInterval(() => this.updateBg(), this.options.bgInterval * 1000);
        }

        if (! this.options.bgEnabled && this.bgTimer) {
            this.destroy();
        }
    }

    async updateBg() {
        const { request: { responseURL: bgUrl } } = await axios.head(`https://source.unsplash.com/${this.options.bgSize}/?${encodeURIComponent(this.options.bgSearchTerm)}`);

        if (! this.bgStyle) {
            this.setup(bgUrl);
        }

        const newBg = document.createElement('style');
        newBg.innerHTML = `:root { --asana-level-up-bg: url(${bgUrl}); }`;
        document.getElementsByTagName('head')[0].appendChild(newBg);
    }

    setup(bgUrl) {
        this.bgStyle = document.createElement('style');
        this.bgStyle.innerHTML = `
               :root {
                    --asana-level-up-bg: url(${bgUrl});
                }
            
                .ThemeSetter-themeBackground {
                    backface-visibility: hidden;
                    background-position: center center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    transition: background-image 2s ease-in-out;
                    background-image: var(--asana-level-up-bg) !important;
                }
                
                .BoardNewColumn h3 span {
                    color: #fff !important;
                }
                
                .BoardAddCardSubtleButton {
                    background-color: #fff !important;
                }
        `;
        document.getElementsByTagName('head')[0].appendChild(this.bgStyle);

        this.mutate();
        this.mutationHandlers.push(() => this.mutate());
    }

    mutate() {
        if (this.options.bgEnabled) {
            document.querySelectorAll('.Board')[0].classList.add('Board--hasBackgroundImage');
        }
    }

    destroy() {
        clearInterval(this.bgTimer);
        this.bgTimer = null;
        this.bgStyle.remove();
    }
}

window.AsanaLevelUp = new AsanaLevelUp();
