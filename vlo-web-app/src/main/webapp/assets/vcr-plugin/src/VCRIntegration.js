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
import Handlebars from 'handlebars/lib/handlebars';
import queueComponentTemplate from "./templates/queueComponent.handlebars";

// icons and styling
import { icons } from './Icons.js';
import "./style/queue.scss";

const renderQueueView = function (queue, config = {}, collectionMetadata = {}) {
    return queueComponentTemplate({
        submitEndpoint: config.endpointUrl || 'https://beta-collections.clarin.eu/submit/extensional',
        name: collectionMetadata.name || config.defaultName || 'No name',
        items: queue,
        icons: config.icons || icons
    });
};

export class VCRIntegration {

    constructor(config) {
        logger.debug('VCRIntegration constructed with configuration', config);
        this.config = config;
        this._applyConfig();
    }

    getQueue() {
        const queue = window.localStorage.getItem('vcrQueue');
        if (queue) {
            return JSON.parse(queue);
        } else {
            return this.saveQueue([]);
        }
    }

    saveQueue(queue) {
        logger.debug('Saving queue: ', queue);
        window.localStorage.setItem('vcrQueue', JSON.stringify(queue));
        return queue;
    }

    clearQueue() {
        logger.debug('Clearing queue: ', this.getQueue());
        window.localStorage.removeItem('vcrQueue');
        logger.info('Queue cleared');
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
        logger.debug('Remove from queue: ', url);
        const index = this.getItemIndex(url);
        if (index >= 0) {
            logger.debug('Remove item ', index);

            const queue = this.getQueue();
            queue.splice(index, 1);

            this.saveQueue(queue);
            logger.info('Removed from queue');
            return true;
        } else {
            return false;
        }
    }

    addToQueue(url, title) {
        if (this.getItemIndex(url) >= 0) {
            logger.info('URL already in queue, not adding again');
        } else {
            const queue = this.getQueue();
            queue.push({'url': url, 'title': title});
            this.saveQueue(queue);
            logger.info('Added to queue');
            logger.debug('New queue: ', this.getQueue());
            this.renderQueue();
        }
    }

    renderQueue() {
        if ($("body #queue-component").length) {
            $("body #queue-component").remove();
        }
        const queue = this.getQueue();
        if (queue && queue.length > 0) {
            $("body").append(renderQueueView(queue, this.config));
        }
    }

    setLogLevel(level) {
        logger.setLevel(level);
    }

    setConfiguration(config, extend = true) {
        if (extend) {
            logger.debug('Extending configuration with new values', config);
            $.extend(this.config, config);
        } else {
            logger.debug('Replacing existing configuration with new values', config);
            this.config = config;
        }
        logger.debug('Applying updated configuration', config);
        this._applyConfig();
    }

    _applyConfig() {
        const cfg = this.config;

        if (!cfg) {
            logger.warn('Configuration object not set, cannot apply configuration!');
        }

        if (cfg.hasOwnProperty('logLevel')) {
            const logLevel = cfg['logLevel'];
            logger.info('Setting log level to ', logLevel);
            this.setLogLevel(logLevel);
        }
    }
}
;
