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

const queueViewTemplate = `
<div id="vcrQueue" style="position: fixed; top: 0px; right: 0px; 
                            min-width: 30em; max-width: 50em; 
                            z-index: 1000; padding: 0 .5em .5em .5em;
                            background: #fff; border: 1px solid #000;">
    <h2>Items to submit to the VCR</h2>
    <ul style="0 0 0 1em"></ul>
    <button id="submitVcrQueue">Submit</button>
    <button id="clearVcrQueue">Clear</button>
</div>
`;

class VCRIntegration {
    
    constructor(config) {
        this.config = config;
    }
    
    getQueue() {
        const queue = window.localStorage.getItem('vcrQueue');
        if(queue) {
            return JSON.parse(queue);//['content'];
        } else {
            return this.saveQueue([]);
        }
    }
    
    saveQueue(queue) {
        window.localStorage.setItem('vcrQueue', JSON.stringify(queue))  ;//{'content': queue}));
        return queue;
    }
    
    clearQueue() {
        window.localStorage.removeItem('vcrQueue');
    }
    
    addToQueue(url) {
        const queue = this.getQueue();
        queue.push({'url': url});
        this.saveQueue(queue);
        console.log('Queue: ');
        console.dir(this.getQueue())
        this.renderQueue();
    }
    
    renderQueue() {
        if($("body #vcrQueue").length) {
            $("body #vcrQueue").remove();
        }
        const queue = this.getQueue();
        if(queue && queue.length > 0) {
            $("body").append(queueViewTemplate);
            const list = $("#vcrQueue ul");        
            queue.forEach(function(qi){
                list.append('<li>'+qi['url']+'</li>');
            });
        }
    }
}

class VCRIntegrationEventHandler {
    
    handleClearQueueEvent() {
        console.log('clear queue');
        vcrIntegration.clearQueue();
        vcrIntegration.renderQueue();
    }

    handleAddToQueueEvent(event) {
        const url = $(event.target).attr('data-vcr-url');
        if(url) {
            vcrIntegration.addToQueue(url);
            // TODO: disable buttons of items that are already in queue
        }
    }
}

const init_plugin = function() {
    vcrIntegration = new VCRIntegration({});
    const eventHandler = new VCRIntegrationEventHandler(vcrIntegration);
    
    $("body").on("click", "#vcrQueue #clearVcrQueue", eventHandler.handleClearQueueEvent)
    
    // if auto registration of handlers enabled
    if($("a[data-vcr-url]").length) {
        console.log("Found one or more VCR queue item controls: " + $("a[data-vcr-url]").length);
        
        // TODO: render 'add to queue' buttons where placeholders are defined
        
        // bind event to add to queue
        $("body").on("click", "a[data-vcr-url]", eventHandler.handleAddToQueueEvent);
    }
    
    const queue = vcrIntegration.getQueue();
    if(queue) {
        vcrIntegration.renderQueue();
    }
};

// global VCRIntegration object
let vcrIntegration = null;
// init when document ready
$(document).ready(init_plugin);
