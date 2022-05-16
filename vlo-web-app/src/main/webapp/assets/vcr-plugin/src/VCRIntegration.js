/* 
 * Copyright (C) 2022 CLARIN
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const queueViewTemplate = function(config, collectionMetadata) {

    if (!config) config = {};
    if (!collectionMetadata) collectionMetadata = {};

    let submitEndpoint = config.endpointUrl || 'https://beta-collections.clarin.eu/submit/extensional';
    let name = collectionMetadata.name || config.defaultName || 'No name';

    return `
    <div id="vcrQueue" style="position: fixed; top: 5px; right: 5px;
                                min-width: 30em; max-width: 50em;
                                z-index: 1000; padding: .5em 1em .5em .5em;
                                background: #fff; border: 1px solid #000;">
        <h2>Items to submit to the VCR</h2>
        <form method="post" action="${submitEndpoint}">
            <input type="hidden" name="name" value="${name}" />
            <ul style="0 0 0 1em"></ul>
            <input id="submitVcrQueue" type="submit" value="Submit" />
            <button id="clearVcrQueue">Clear</button>
        </form>
    </div>
    `;
};

export class VCRIntegration {

    constructor(config) {
        this.config = config;
    }

    getQueue() {
        const queue = window.localStorage.getItem('vcrQueue');
        if (queue) {
            return JSON.parse(queue);//['content'];
        } else {
            return this.saveQueue([]);
        }
    }

    saveQueue(queue) {
        window.localStorage.setItem('vcrQueue', JSON.stringify(queue));//{'content': queue}));
        return queue;
    }

    clearQueue() {
        window.localStorage.removeItem('vcrQueue');
    }

    getItemIndex(url) {
        const queue = this.getQueue();
        for (let i = 0; i < queue.length; i++) {
            if (queue[i]['url'] === url) {
                return i;
            }
        }
        return -1;
    }

    removeFromQueue(url) {
        console.log('Remove from queue: ' + url);
        const index = this.getItemIndex(url);
        if (index >= 0) {
            console.log('Remove item ' + index);

            const queue = this.getQueue();
            queue.splice(index, 1);

            this.saveQueue(queue);
            return true;
        } else {
            return false;
        }
    }

    addToQueue(url, title) {
        if(this.getItemIndex(url) >= 0) {
            console.log('URL already in queue');
        } else {
            const queue = this.getQueue();
            queue.push({'url': url, 'title': title});
            this.saveQueue(queue);
            console.log('Queue: ');
            console.dir(this.getQueue());
            this.renderQueue();
        }
    }

    renderQueue() {
        if ($("body #vcrQueue").length) {
            $("body #vcrQueue").remove();
        }
        const queue = this.getQueue();
        if (queue && queue.length > 0) {
            $("body").append(queueViewTemplate(this.config));
            const list = $("#vcrQueue ul");
            queue.forEach(function (qi) {
                let resourceUriValue = JSON.stringify({
                    "uri": qi['url'],
                    "label": qi['title']
                }).replaceAll('"', '&quot;');
                list.append('<li data-vcr-url="' + qi['url'] + '">'
                + qi['title']
                + ' <a class="removeFromVcrQueue" style="color: red; text-decoration: none;" href="#">X</a>'
                + ' <input type="hidden" name="resourceUri" value="' + resourceUriValue + '" />'
                + '</li>');
            });
        }
    }
};
