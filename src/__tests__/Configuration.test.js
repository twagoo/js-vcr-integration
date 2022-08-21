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

import {configProperties, defaultConfig, mergeWithDefaultConfig} from './../Configuration.js';
import logger from 'loglevel';

logger.setLevel(logger.levels.INFO);

logger.debug('Config properties', configProperties);
logger.debug('Default config', defaultConfig);

test('Size of config properties list', () => {
   expect(Object.keys(configProperties)).toHaveLength(9);
});

test('Content of config properties object', () => {
   expect(configProperties).toHaveProperty('SETTING_LOGLEVEL', 'logLevel');
});

test('Merging empty config should give the default config', () => {
    expect(defaultConfig).toEqual({
        "logLevel": "info",
        "queueControlPosition": "bottom-right",
        "endpointUrl": "https://collections.clarin.eu/submit/extensional",
        "defaultName": "No name",
        "maxItemCount": 100,
        "autoInitialize": true,
        "autoDisableAddedItemLinks": true
    });
});
