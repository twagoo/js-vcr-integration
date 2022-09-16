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

import 'jest';
import _cloneDeep from 'lodash/cloneDeep';

import { VCRIntegration } from './../VCRIntegration.js';

// Configuration
import { defaultConfig, configProperties as cfp } from '../Configuration.js';

var config;
var vcrIntegration;

beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
    window.localStorage.clear();
    config = _cloneDeep(defaultConfig);
    vcrIntegration = new VCRIntegration(config);
    vcrIntegration.setLogLevel('error');
});

test('Start with empty queue', () => {
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});

test('Adding item', () => {
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    const item = vcrIntegration.getQueue()[0];
    expect(item).toHaveProperty('uri');
    expect(item).toHaveProperty('label');
    expect(item).not.toHaveProperty('description');
});

test('Adding item with description', () => {
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1', 'test description1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    const item = vcrIntegration.getQueue()[0];
    expect(item).toHaveProperty('uri');
    expect(item).toHaveProperty('label');
    expect(item).toHaveProperty('description');
});

test('Adding same item twice, should only end up in queue once', () => {
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});


test('Adding multiple items at once', () => {
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addAllToQueue([{ uri: 'https://wwww.clarin.eu/1', label: 'test1', description: 'test description 1' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    expect(vcrIntegration.getQueue()).toContainEqual({ uri: 'https://wwww.clarin.eu/1', label: 'test1', description: 'test description 1' });
    // add multiple
    vcrIntegration.addAllToQueue([
        { uri: 'https://wwww.clarin.eu/2', label: 'test2' },
        { uri: 'https://wwww.clarin.eu/3', label: 'test3' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3);
    expect(vcrIntegration.getQueue()).toContainEqual({ uri: 'https://wwww.clarin.eu/1', label: 'test1', description: 'test description 1' });
    expect(vcrIntegration.getQueue()).toContainEqual({ uri: 'https://wwww.clarin.eu/2', label: 'test2' });
    expect(vcrIntegration.getQueue()).toContainEqual({ uri: 'https://wwww.clarin.eu/3', label: 'test3' });
    // add existing
    vcrIntegration.addAllToQueue([
        { uri: 'https://wwww.clarin.eu/1', label: 'test2' },
        { uri: 'https://wwww.clarin.eu/2', label: 'test3' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3); // same as before
    // add broken
    vcrIntegration.addAllToQueue([
        { foo: 'https://wwww.clarin.eu/4', label: 'test4' },
        { uri: 'https://wwww.clarin.eu/5', bar: 'test5' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3); // same as before
});

test('Removing items', () => {
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    vcrIntegration.addToQueue('https://wwww.clarin.eu/2', 'test2');
    vcrIntegration.addToQueue('https://wwww.clarin.eu/3', 'test3');
    expect(vcrIntegration.getQueue()).toHaveLength(3);
    // remove same item twice
    vcrIntegration.removeFromQueue('https://wwww.clarin.eu/1');
    expect(vcrIntegration.getQueue()).toHaveLength(2);
    vcrIntegration.removeFromQueue('https://wwww.clarin.eu/1');
    expect(vcrIntegration.getQueue()).toHaveLength(2);
    // remove two items at once
    vcrIntegration.removeFromQueue(['https://wwww.clarin.eu/2', 'https://wwww.clarin.eu/3']);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});

test('Adding item beyond limit', () => {
    // set item limit to 1
    config[cfp.SETTING_MAX_ITEM_COUNT] = 1;

    expect(vcrIntegration.getQueue()).toHaveLength(0);
    // first item should be accepted
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    // further items should be refused
    vcrIntegration.addToQueue('https://wwww.clarin.eu/2', 'test2');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    vcrIntegration.addAllToQueue([
        { uri: 'https://wwww.clarin.eu/3', label: 'test3' },
        { uri: 'https://wwww.clarin.eu/4', label: 'test4' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});

test('Adding multiple beyond limit', () => {
    // set item limit to 1
    config[cfp.SETTING_MAX_ITEM_COUNT] = 1;

    expect(vcrIntegration.getQueue()).toHaveLength(0);
    // all items should be refused
    vcrIntegration.addAllToQueue([
        { uri: 'https://wwww.clarin.eu/1', label: 'test1' },
        { uri: 'https://wwww.clarin.eu/2', label: 'test2' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});
