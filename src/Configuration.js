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

import _merge from 'lodash/merge';
import _filter from 'lodash/filter';
import _mapKeys from 'lodash/mapKeys';
import _mapValues from 'lodash/mapValues';

import logger from 'loglevel';

const DEFAULT_MAX_ITEM_COUNT = 100;
const DEFAULT_ENDPOINT_URL = "https://collections.clarin.eu/submit/extensional";
const DEFAULT_DEFAULT_NAME = "No name";
const DEFAULT_QUEUE_CONTROL_POSITION = "bottom-right";
const DEFAULT_LOGLEVEL = "info";
const DEFAULT_AUTO_INIT = true;
const DEFAULT_AUTO_DISABLE_ADDED_ITEM_LINKS = true;

const configDefinitions = {
    // initial log level
    "SETTING_LOGLEVEL": ["logLevel", DEFAULT_LOGLEVEL],
    // URL to submit queue to
    "SETTING_ENDPOINT_URL": ["endpointUrl", DEFAULT_ENDPOINT_URL],
    // position of queue control on page ('top-right', 'bottom-right', 'bottom-left' or 'top-left')
    "SETTING_QUEUE_CONTROL_POSITION": ["queueControlPosition", DEFAULT_QUEUE_CONTROL_POSITION],
    // whether to automatically initialize
    "SETTING_AUTO_INIT": ["autoInitialize", DEFAULT_AUTO_INIT],
    // maximum number of items allowed in the queue
    "SETTING_MAX_ITEM_COUNT": ["maxItemCount", DEFAULT_MAX_ITEM_COUNT],
    // whether to automatically enable/disable 'add to queue' links
    "SETTING_AUTO_DISABLE_ADDED_ITEM_LINKS": ["autoDisableAddedItemLinks", DEFAULT_AUTO_DISABLE_ADDED_ITEM_LINKS],
    // default collection name
    "SETTING_DEFAULT_NAME": ["defaultName", DEFAULT_DEFAULT_NAME],
    // for an additional CSS class on the queue component (no default)
    "SETTING_CUSTOM_QUEUE_COMPONENT_CLASS": "customQueueComponentClass",
    // for custom icons (no default)
    "SETTING_ICONS": "icons"
};

export const configProperties = _mapValues(configDefinitions, (value) => {
    if (Array.isArray(value) && value.length > 0) {
        return value[0];
    } else {
        return value;
    }
});

export const defaultConfig = _mapValues(_mapKeys(
        // array definitions with item at index 1 have a default
        _filter(configDefinitions, (value) => Array.isArray(value) && value.length > 1),
        //mapKeys (key at [0])
                (value) => value[0]),
        //mapValues (value at [1])
                (value) => value[1]);

export const mergeWithDefaultConfig = function (config) {
    let combined = {};
    logger.debug('Merging incoming configuration', config, 'with default configuration', defaultConfig);
    _merge(combined, defaultConfig, config);
    return combined;
};
