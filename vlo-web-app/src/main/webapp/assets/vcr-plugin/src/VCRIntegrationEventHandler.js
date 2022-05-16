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

import $ from 'jquery';

export class VCRIntegrationEventHandler {
        
    constructor(vcrIntegration) {
        this.vcrIntegration = vcrIntegration;
        self = this;
    }

    handleClearQueueEvent() {
        console.log('clear queue');
        this.vcrIntegration.clearQueue();
        this.vcrIntegration.renderQueue();
    }

    handleRemoveFromQueueEvent(event) {
        console.log('remove from queue');
        const url = $(event.target).parent().attr('data-vcr-url');
        if (this.vcrIntegration.removeFromQueue(url)) {
            this.vcrIntegration.renderQueue();
        }
    }

    handleAddToQueueEvent(event) {
        const url = $(event.target).attr('data-vcr-url');
        const title = $(event.target).attr('data-vcr-title');
        if (url) {
            this.vcrIntegration.addToQueue(url, title);
            // TODO: disable buttons of items that are already in queue
        }
    }
};
