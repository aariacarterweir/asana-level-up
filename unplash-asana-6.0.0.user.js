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

        this.bg = new Bg(this.options);
    }
}

class Bg {
    constructor(options) {
        this.options = options;
        this.boot();
    }

    boot() {
        if (this.options.bgEnabled && ! this.bgTimer) {
            this.bgTimer = (() => { this.updateBg(); return setInterval(() => this.updateBg(), this.options.bgInterval * 1000); })();
        }

        if (! this.options.bgEnabled && this.bgTimer) {
            clearInterval(this.bgTimer);
            this.bgTimer = null;
            this.bgStyle.remove();
            this.bgMutationObserver.disconnect();
        }
    }

    getNewBg() {
        return axios.get(`https://source.unsplash.com/${this.options.bgSize}/?${encodeURIComponent(this.options.bgSearchTerm)}`);
    }

    async updateBg() {
        const { request: { responseURL: bgUrl } } = await this.getNewBg();

        if (! this.bgStyle) {
            this.setupBgStyle(bgUrl);
        }

        const newBg = document.createElement('style');
        newBg.innerHTML = `
            :root {
                --asana-level-up-bg: url(${bgUrl});
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(newBg);
    }

    setupBgStyle(bgUrl) {
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

        const addBoardBgClass = _.debounce(() => document.querySelectorAll('.Board')[0].classList.add('Board--hasBackgroundImage'), 150);
        this.bgMutationObserver = new MutationObserver(addBoardBgClass);
        this.bgMutationObserver.observe(document.querySelectorAll('.AppRoot')[0], {
            childList: true,
            attributes: false,
            subtree: true,
        });
        addBoardBgClass();
    }
}

window.AsanaLevelUp = new AsanaLevelUp();
