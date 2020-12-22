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
            bgSize: '2400x1350',
            bgSearchTerm: 'sunrise, ocean, surf',
        }, localStorage.getItem('options_asana_level-up') || {});

        this.boot();
    }

    boot() {
        if (this.options.bgEnabled) {
            this.bgTimer = (() => { this.updateBg(); return setInterval(() => this.updateBg(), this.options.bgInterval * 1000); })();
        }
    }

    getNewBg() {
        return axios.get(`https://source.unsplash.com/${this.options.bgSize}/?${encodeURIComponent(this.options.bgSearchTerm)}`);
    }

    async updateBg() {
        const newBgImg = await this.getNewBg();

        console.log(newBgImg);

        if (! this.bgStyle) {
            this.bgStyle = document.createElement('style');
            document.getElementsByTagName('head')[0].appendChild(this.bgStyle);
            this.bgStyle.innerHTML = `
               :root {
                    --asana-level-up-bg: url(${newBgImg});
                }
            
                body,
                #bg_pattern {
                    backface-visibility: hidden;
                    background-position: center center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    transition: background-image 2s ease-in-out;
                    background-image: var(--asana-level-up-bg);
                }
            `;
        }

        const newBg = document.createElement('style');
        newBg.innerHTML = `
            :root {
                --asana-level-up-bg: url(${newBgImg});
            }
        `;

        document.getElementsByTagName('head')[0].appendChild(newBg);
    }
}

window.AsanaLevelUp = new AsanaLevelUp();
