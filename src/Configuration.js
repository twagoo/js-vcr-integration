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

const configDefinitions = {
    "SETTING_LOGLEVEL": ["logLevel", "info"],
    "SETTING_QUEUE_CONTROL_POSITION": ["queueControlPosition", "bottom-right"],
    "SETTING_ICONS": "icons",
    "SETTING_ENDPOINT_URL": ["endpointUrl", "https://beta-collections.clarin.eu/submit/extensional"],
    "SETTING_DEFAULT_NAME": ["defaultName", "No name"],
    "SETTING_AUTO_INIT": ["autoInitialize", true],
    "SETTING_MAX_ITEM_COUNT": ["maxItemCount", 100]
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
