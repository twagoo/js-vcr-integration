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
import _escape from 'lodash/escape';
import queueComponentTemplate from './templates/queueComponent.handlebars';

// icons and styling
import { icons } from './Icons.js';
import "./style/queue.scss";

// configuration properties
import { configProperties as cfp } from './Configuration.js';
// shared constants
import { QUEUE_CONTROL_MINIMIZED_CLASS } from './Constants.js';

const global = this || window;

const renderQueueView = function (queue, config = {}, collectionMetadata = {}) {
    let values = {
        config: config,
        submitEndpoint: config[cfp.SETTING_ENDPOINT_URL],
        name: collectionMetadata.name || config[cfp.SETTING_DEFAULT_NAME],
        items: queue,
        position: config[cfp.SETTING_QUEUE_CONTROL_POSITION],
        icons: config[cfp.SETTING_ICONS] || icons,
        customClass: config[cfp.SETTING_CUSTOM_QUEUE_COMPONENT_CLASS] || ""
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
    constructor(config, storage) {
        logger.debug('VCRIntegration constructed with configuration', config);
        this.config = config;
        this._applyConfig();

        if (storage) {
            this.storage = storage;
        } else {
            if (global && global.localStorage) {
                logger.info('Using local storage provided by global context');
                this.storage = global.localStorage;
            } else {
                logger.error('No localstorage on global object and no explicit storage passed to constructor');
            }
        }
    }

    /**
     * Get the current contents of the queue from local storage
     * @returns {Array} the queue
     */
    getQueue() {
        const queue = this.storage.getItem('vcrQueue');
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
     * @param {String|Array} url
     * @returns {Boolean} whether an item has been removed
     */
    removeFromQueue(url) {
        if (Array.isArray(url)) {
            url.forEach(u => this.removeFromQueue(u));
        } else {
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
    }

    /**
     * Adds a single item to the queue
     * @param {String} url URL of item
     * @param {String} title Title for item
     * @returns {None}
     */
    addToQueue(url, title) {
        if (this.getItemIndex(url) >= 0) {
            logger.info('URL already in queue, not adding again');
        } else {
            const queue = this.getQueue();
            if (queue.length >= this.config[cfp.SETTING_MAX_ITEM_COUNT]) {
                logger.warn("Cannot add item, maximum number of items in queue reached or exceeded (", this.config[cfp.SETTING_MAX_ITEM_COUNT], ")")
                this.setErrorMessage("Queue is full, cannot add more items");
            } else {
                queue.push({ 'url': url, 'title': title });
                this.saveQueue(queue);
                logger.info('Added to queue');
                logger.debug('New queue: ', this.getQueue());
                this.renderQueue();
            }
        }
    }

    /**
     * Adds zero or more items to the queue
     * @param {Array} items Array of objects with 'url' and 'title' options
     */
    addAllToQueue(items) {
        items.forEach(item => {
            if (item.hasOwnProperty('url') && item.hasOwnProperty('title')) {
                this.addToQueue(item.url, item.title);
            } else {
                logger.error('Skipping item: does not contain url and/or title', item);
            }
        });
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

    setErrorMessage(message) {
        const messageContainer = $("#queue-component .queue-control-message-content-container");
        const messageContent = messageContainer.children('.queue-control-message-content');

        //unhide container
        messageContainer.removeClass('hidden');
        // append message
        messageContent.append('<div>' + _escape(message) + '</div>');
    }

    clearErrorMessage(containerElement) {
        //set container to hidden mode
        containerElement.addClass('hidden');
        //clear message content
        containerElement.children('.queue-control-message-content').html('');
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

        if (cfg.hasOwnProperty(cfp.SETTING_LOGLEVEL)) {
            const logLevel = cfg[cfp.SETTING_LOGLEVEL];
            logger.info('Setting log level to ', logLevel);
            this.setLogLevel(logLevel);
        }
    }
}

const getQueueControlObject = function () {
    return $("body #queue-component");
};
