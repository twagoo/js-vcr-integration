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
import helpTemplate from './templates/info.handlebars';

// icons and styling
import { icons } from './Icons.js';
import "./style/queue.scss";

// configuration properties
import { configProperties as cfp } from './Configuration.js';
// shared constants
import { QUEUE_CONTROL_MINIMIZED_CLASS, STORED_STATED_KEY_MINIMIZED, STORED_STATED_KEY_SUBMITTED } from './Constants.js';

const global = this || window;

/**
 * VCR integration object; this is the main interface for browser/client interaction
 * @type class 
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
                this.storage = global.localStorage;
                logger.debug('Using local storage provided by global context:', this.storage);
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
            // create new queue
            // first make sure that submitted state is reset
            this.setSubmittedState(false);
            // empty queue, save to storage
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
        this.storage.setItem('vcrQueue', JSON.stringify(queue));
        return queue;
    }

    /**
     * Clears the queue
     * @returns {None}
     */
    clearQueue() {
        logger.debug('Clearing queue: ', this.getQueue());
        this.storage.removeItem('vcrQueue');
        logger.info('Queue cleared');

        // reset submitted state
        this.setSubmittedState(false);

        // reset minimized state
        this.setMinimizedState(false);

        // any links to add items to the queue need to get re-enabled
        this.updatedAddLinkEnabledState(true);
    }

    /**
     * Returns the numeric index of a given URL in the current queue
     * @param {String} url
     * @returns {Number} index of URL in queue array, or -1 if not present
     */
    getItemIndex(url) {
        const queue = this.getQueue();
        for (let i = 0; i < queue.length; i++) {
            if (queue[i]['uri'] === url) {
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

                // queue altered: reset submitted state
                this.setSubmittedState(false);

                logger.info('Removed from queue');

                // any links to add this item to the queue needs to get re-enabled
                this.updatedAddLinkEnabledState(true);

                return true;
            } else {
                return false;
            }
        }
    }

    /**
     * Adds a single item to the queue
     * @param {String} uri URI of item
     * @param {String} label Label or title for item
     * @returns {None}
     */
    addToQueue(uri, label, description) {
        if (this.getItemIndex(uri) >= 0) {
            logger.info('URL already in queue, not adding again');
        } else {
            const queue = this.getQueue();
            if (queue.length >= this.config[cfp.SETTING_MAX_ITEM_COUNT]) {
                logger.warn("Cannot add item, maximum number of items in queue reached or exceeded (", this.config[cfp.SETTING_MAX_ITEM_COUNT], ")")
                this.showQueueControl();
                this.setErrorMessage("Queue is full, cannot add more items");
            } else {
                queue.push({ 'uri': uri, 'label': label, 'description': description});
                this.saveQueue(queue);

                // queue altered: reset submitted state
                this.setSubmittedState(false);

                logger.info('Added to queue');
                logger.debug('New queue: ', this.getQueue());
                this.renderQueue();

                // links adding this item to the queue should get disabled
                this.updatedAddLinkEnabledState(true);

                if(this.getMinimizedState()) {
                    // flash component
                    $("#queue-component").fadeOut(50).fadeIn(250);
                }
            }
        }
    }

    /**
     * Adds zero or more items to the queue
     * @param {Array} items Array of objects with 'uri' and 'label' keys
     */
    addAllToQueue(items) {
        if (items.length == 0) {
            logger.info('No items in add request');
        } else {
            const queue = this.getQueue();
            if (queue.length + items.length >= this.config[cfp.SETTING_MAX_ITEM_COUNT]) {
                logger.warn("Cannot add item(s), maximum number of items in queue will be reached or exceeded (", this.config[cfp.SETTING_MAX_ITEM_COUNT], ")")
                this.setErrorMessage("Cannot add items, queue length reached");
            } else {
                items.forEach(item => {
                    if (item.hasOwnProperty('uri') && item.hasOwnProperty('label')) {
                        this.addToQueue(item.uri, item.label);
                    } else {
                        logger.warn('Skipping item: does not contain url and/or title', item);
                    }
                });
            }
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
            $("body").append(renderQueueView(queue, this.getSubmittedState(), this.getMinimizedState(), this.config));
            if (classAttrVal) {
                getQueueControlObject().attr('class', classAttrVal);
            }
            // make sure that the last (i.e. added) item is in view
            const listItems = $('ul.queue-items li:nth-last-child(1)', getQueueControlObject());
            if (listItems.length > 0) {
                listItems[0].scrollIntoView();
            }
        }
    }

    /**
     * Puts the queue component (if shown) in minimized mode
     * @returns {Boolean} whether the component was minimized
     */
    hideQueueControl() {
        this.setMinimizedState(true);

        // add minimized class
        let component = getQueueControlObject();
        if (component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            return false;
        } else {
            getQueueControlObject().addClass(QUEUE_CONTROL_MINIMIZED_CLASS);
            logger.debug('Component has been minimized');
            return true;
        }
    }

    /**
     * Puts the queue component (if shown) in de-minimized mode
     * @returns {Boolean} whether the component was de-minimized
     */
    showQueueControl() {
        this.setMinimizedState(false);

        // remove minimized class
        let component = getQueueControlObject();
        if (component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            getQueueControlObject().removeClass(QUEUE_CONTROL_MINIMIZED_CLASS);
            return true;
        } else {
            logger.debug('Component has been de-minimized');
            return false;
        }
    }

    /**
     * Toggels the minimized mode of the queue component (if shown)
     * @returns {None}
     */
    toggleQueueControl() {
        let component = getQueueControlObject();
        if (this.getMinimizedState() || component.hasClass(QUEUE_CONTROL_MINIMIZED_CLASS)) {
            this.showQueueControl();
        } else {
            this.hideQueueControl();
        }
        logger.debug('Component minimized state has been toggled');
    }

    /**
     * Adds an error message to the component
     * @param {string} message to show
     */
    setErrorMessage(message) {
        const messageContainer = $("#queue-component .queue-control-message-content-container");
        const messageContent = $('.queue-control-message-content', messageContainer);

        //unhide container
        messageContainer.removeClass('hidden');
        // append message
        messageContent.append('<div>' + _escape(message) + '</div>');
    }

    /**
     * Clears the specified error message(s) element
     * @param {object} containerElement element to clear
     */
    clearErrorMessage(containerElement) {
        //set container to hidden mode
        containerElement.addClass('hidden');
        //clear message content
        $('.queue-control-message-content', containerElement).html('');
    }

    /**
     * Enables and disables 'add to queue' links based on queue content
     * @param {Boolean} onlyIfConfigAllows if true, does nothing unless configuration allows auto enable/disable
     */
    updatedAddLinkEnabledState(onlyIfConfigAllows = false) {
        if (!onlyIfConfigAllows || this.config[cfp.SETTING_AUTO_DISABLE_ADDED_ITEM_LINKS]) {
            logger.debug('Updating the state of all "add to VCR" links');
            $('a[data-vcr-uri]').removeAttr('disabled');
            this.getQueue().forEach((item) => {
                $('a[data-vcr-uri="' + item['uri'] + '"]').attr('disabled', 'disabled');
            });
        } else {
            logger.debug('NOT updating state of "add to VCR" links');
        }
    }

    /**
     * Shows a modal dialogue with help/info
     */
    showHelp() {
        $('body').append(helpTemplate());
    }

    /**
     * Sets the current log level
     * @param {String} level log level ('debug', 'info', 'warn' or 'error')
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

    /**
     * Set current submitted state
     * @param {boolean} state 
     */
    setSubmittedState(state) {
        logger.debug('Setting submitted state:', state);
        if (state) {
            this.storage.setItem(STORED_STATED_KEY_SUBMITTED, state);
        } else {
            this.storage.removeItem(STORED_STATED_KEY_SUBMITTED);
        }
    }

    getSubmittedState() {
        return this.storage.getItem(STORED_STATED_KEY_SUBMITTED);
    }

    /**
     * Set current minimized state
     * @param {boolean} state 
     */
    setMinimizedState(state) {
        logger.debug('Setting minimized state:', state);
        if (state) {
            this.storage.setItem(STORED_STATED_KEY_MINIMIZED, state);
        } else {
            this.storage.removeItem(STORED_STATED_KEY_MINIMIZED);
        }
    }

    getMinimizedState() {
        return this.storage.getItem(STORED_STATED_KEY_MINIMIZED);
    }
}

/**
 * Renders the queue component into an HTML element
 * @param {Object[]} queue 
 * @param {boolean} submittedState 
 * @param {boolean} minimizedState 
 * @param {Object} config 
 * @param {Object} collectionMetadata 
 * @returns HTML for queue component
 */
 const renderQueueView = function (queue, submittedState, minimizedState, config = {}, collectionMetadata = {}) {
    let values = {
        items: queue,
        submitted: submittedState,
        config: config,
        submitEndpoint: config[cfp.SETTING_ENDPOINT_URL],
        name: collectionMetadata.name || config[cfp.SETTING_DEFAULT_NAME],
        position: config[cfp.SETTING_QUEUE_CONTROL_POSITION],
        icons: config[cfp.SETTING_ICONS] || icons,
        customClass: config[cfp.SETTING_CUSTOM_QUEUE_COMPONENT_CLASS] || "",
        minimizedClass: minimizedState ? QUEUE_CONTROL_MINIMIZED_CLASS : ""
    };

    logger.debug('Rendering queue with', values);
    return queueComponentTemplate(values);
};

const getQueueControlObject = function () {
    return $("body #queue-component");
};
