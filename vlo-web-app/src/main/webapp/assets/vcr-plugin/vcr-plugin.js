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

class VCRIntegration {
    
    constructor(config) {
        this.config = config;
    }
    
    addToQueue(url) {
        alert('Add to queue: ' + url);
    }
}

class VCRIntegrationEventHandler {

    handleAddToQueueEvent(event) {
        const url = $(event.target).attr('data-vcr-url');
        if(url) {
            vcrIntegration.addToQueue(url);
        }
    }
}

const init_plugin = function() {
    if($("a[data-vcr-url]").length) {
        console.log("Found one or more VCR queue item controls: " + $("a[data-vcr-url]").length);
        
        vcrIntegration = new VCRIntegration({});
        const eventHandler = new VCRIntegrationEventHandler(vcrIntegration);
        // bind event to add to queue
        $("body").on("click", "a[data-vcr-url]", eventHandler.handleAddToQueueEvent);
    }
};

// global VCRIntegration object
let vcrIntegration = null;
// init when document ready
$(document).ready(init_plugin);
