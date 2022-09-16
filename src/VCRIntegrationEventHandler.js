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
import logger from 'loglevel';

export class VCRIntegrationEventHandler {

    constructor(vcrIntegration) {
        this.vcrIntegration = vcrIntegration;
        self = this;
    }

    handleOnSubmit() {
        logger.debug('Setting submitted state to true');
        self.vcrIntegration.setSubmittedState(true);
    }

    handleClearQueueEvent() {
        event.preventDefault();

        logger.debug('Handling clear queue event');
        self.vcrIntegration.clearQueue();
        logger.debug('Re-rendering for cleared queue');
        self.vcrIntegration.renderQueue();
    }

    handleRemoveFromQueueEvent(event) {
        event.preventDefault();

        logger.debug('Handling remove from queue event');
        const url = $(event.currentTarget).parent().attr('data-vcr-uri');
        if (url) {
            if (self.vcrIntegration.removeFromQueue(url)) {
                self.vcrIntegration.renderQueue();
            } else {
                logger.warn('Failed to remove from queue: ', url);
            }
        } else {
            logger.warn('Cannot remove from queue, no URL on context: ', $(event.currentTarget));
        }
    }

    handleAddToQueueEvent(event) {
        event.preventDefault();
        logger.debug('Handling add to queue event');

        const url = $(event.currentTarget).attr('data-vcr-uri');
        const title = $(event.currentTarget).attr('data-vcr-label');
        const description = $(event.currentTarget).attr('data-vcr-description');
        if (url) {
            self.vcrIntegration.addToQueue(url, title, description);
        } else {
            logger.warn('Cannot add to queue, no URL on context: ', $(event.currentTarget));
        }
    }

    handleVcrQueueMinimizedToggle(event) {
        event.preventDefault();
        logger.debug('Handling toggling queue component minimized state event');

        self.vcrIntegration.toggleQueueControl();
    }

    handleCloseWarning(event) {
        event.preventDefault();
        logger.debug('Handling close warning event');

        self.vcrIntegration.clearErrorMessage($(event.currentTarget).parent());
    }

    handleShowHelp(event) {
        event.preventDefault();
        logger.debug('Handling show help event');

        self.vcrIntegration.showHelp();
    }
}
