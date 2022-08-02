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

// shared constants
import {QUEUE_CONTROL_MINIMIZED_CLASS} from './Constants.js';
// configuration properties
import {SETTING_LOGLEVEL, SETTING_QUEUE_CONTROL_POSITION,
        SETTING_ICONS, SETTING_ENDPOINT_URL,
        SETTING_DEFAULT_NAME} from './Constants.js';


const renderQueueView = function (queue, config = {}, collectionMetadata = {}) {
    let values = {
        config: config,
        submitEndpoint: config[SETTING_ENDPOINT_URL] || 'https://beta-collections.clarin.eu/submit/extensional',
        name: collectionMetadata.name || config[SETTING_DEFAULT_NAME] || 'No name',
        items: queue,
        position: config[SETTING_QUEUE_CONTROL_POSITION] || 'bottom-right',
        icons: config[SETTING_ICONS] || icons
    };

    logger.debug('Rendering queue with', values);
    return queueComponentTemplate(values);
};

/**
 * VCR integration object
 * @type type
 */
export class VCRIntegration {
    /**
     * Creates a new VCR integration object
     * @param {Object} config Configuration for the VCR integration
     * @returns {VCRIntegration}
     * @class
     */
    constructor(config) {
        logger.debug('VCRIntegration constructed with configuration', config);
        this.config = config;
        this._applyConfig();
    }

    /**
     * Get the current contents of the queue from local storage
     * @returns {Array} the queue
     */
    getQueue() {
        const queue = window.localStorage.getItem('vcrQueue');
        if (queue) {
            return JSON.parse(queue);
        } else {
            return this.saveQueue([]);
        }
    }

    /**
     * Saves a queue to local storage
     * @param {Array} queue
     * @returns {Array} the queue that was passed
     */
    saveQueue(queue) {
        logger.debug('Saving queue: ', queue);
        window.localStorage.setItem('vcrQueue', JSON.stringify(queue));
        return queue;
    }

    /**
     * Clears the queue
     * @returns {None}
     */
    clearQueue() {
        logger.debug('Clearing queue: ', this.getQueue());
        window.localStorage.removeItem('vcrQueue');
        logger.info('Queue cleared');
    }

    /**
     * Returns the numeric index of a given URL in the current queue
     * @param {String} url
     * @returns {Number} index of URL in queue array, or -1 if not present
     */
    getItemIndex(url) {
        const queue = this.getQueue();
        for (let i = 0; i < queue.length; i++) {
            if (queue[i]['url'] === url) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Removes an item from the queue on basis of its URL
     * @param {String} url
     * @returns {Boolean} whether an item has been removed
     */
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

    /**
     * Adds an item to the queue
     * @param {String} url URL of item
     * @param {String} title Title for item
     * @returns {None}
     */
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

    /**
     * Renders or re-renders the queue component on the page
     * @returns {None}
     */
    renderQueue() {
        // detect and remove existing queue component
        var classAttrVal = null;
        if (getQueueControlObject().length) {
            // capture value of class attribute to restore after rendering
            classAttrVal = getQueueControlObject().attr('class');
            getQueueControlObject().remove();
        }

        // if there are items, render the queue component
        const queue = this.getQueue();
        if (queue && queue.length > 0) {
            $("body").append(renderQueueView(queue, this.config));
            if (classAttrVal) {
                getQueueControlObject().attr('class', classAttrVal);
            }
        }
    }

    /**
     * Puts the queue component (if shown) in minimized mode
     * @returns {Boolean} whether the component was minimized
     */
    hideQueueControl() {
        let component = getQueueControlObject();
        if (component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            return false;
        } else {
            getQueueControlObject().addClass(QUEUE_CONTROL_MINIMIZED_CLASS);
            return true;
        }
    }

    /**
     * Puts the queue component (if shown) in de-minimized mode
     * @returns {Boolean} whether the component was de-minimized
     */
    showQueueControl() {
        let component = getQueueControlObject();
        if (component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            getQueueControlObject().removeClass(QUEUE_CONTROL_MINIMIZED_CLASS);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Toggels the minimized mode of the queue component (if shown)
     * @returns {None}
     */
    toggleQueueControl() {
        let component = getQueueControlObject();
        if (component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            getQueueControlObject().removeClass(QUEUE_CONTROL_MINIMIZED_CLASS);
        } else {
            getQueueControlObject().addClass(QUEUE_CONTROL_MINIMIZED_CLASS);
        }
    }

    /**
     * Sets the current log level
     * @param {String} level log level ('debug', 'info' or 'warn')
     * @returns {None}
     */
    setLogLevel(level) {
        logger.setLevel(level);
    }

    /**
     * Sets or extends the configuration
     * @param {Object} config configuration object to apply
     * @param {Boolean} extend whether to extend the existing configuration (if false, replaces all previous configuration)
     * @returns {None}
     */
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

    /**
     * 
     * @access private 
     */
    _applyConfig() {
        const cfg = this.config;

        if (!cfg) {
            logger.warn('Configuration object not set, cannot apply configuration!');
        }

        if (cfg.hasOwnProperty(SETTING_LOGLEVEL)) {
            const logLevel = cfg[SETTING_LOGLEVEL];
            logger.info('Setting log level to ', logLevel);
            this.setLogLevel(logLevel);
        }
    }
}

const getQueueControlObject = function () {
    return $("body #queue-component");
};
