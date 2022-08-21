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

import { VCRIntegration } from './../VCRIntegration.js';
// configuration properties
import { defaultConfig, configProperties as cfp } from '../Configuration.js';
import _cloneDeep from 'lodash/cloneDeep';

var config;

beforeEach(() => {
    window.localStorage.clear();
    config = _cloneDeep(defaultConfig);
});

test('Start with empty queue', () => {
    const vcrIntegration = new VCRIntegration(config);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});

test('Adding item', () => {
    const vcrIntegration = new VCRIntegration(config);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});

test('Adding same item twice, should only end up in queue once', () => {
    const vcrIntegration = new VCRIntegration(config);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});


test('Adding multiple items at once', () => {
    const vcrIntegration = new VCRIntegration(config);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addAllToQueue([{ url: 'https://wwww.clarin.eu/1', title: 'test1' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    expect(vcrIntegration.getQueue()).toContainEqual({ url: 'https://wwww.clarin.eu/1', title: 'test1' });
    // add multiple
    vcrIntegration.addAllToQueue([
        { url: 'https://wwww.clarin.eu/2', title: 'test2' },
        { url: 'https://wwww.clarin.eu/3', title: 'test3' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3);
    expect(vcrIntegration.getQueue()).toContainEqual({ url: 'https://wwww.clarin.eu/1', title: 'test1' });
    // add existing
    vcrIntegration.addAllToQueue([
        { url: 'https://wwww.clarin.eu/1', title: 'test2' },
        { url: 'https://wwww.clarin.eu/2', title: 'test3' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3); // same as before
    // add broken
    vcrIntegration.addAllToQueue([
        { foo: 'https://wwww.clarin.eu/4', title: 'test4' },
        { url: 'https://wwww.clarin.eu/5', bar: 'test5' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(3); // same as before
});

test('Removing items', () => {
    const vcrIntegration = new VCRIntegration(config);
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
    const vcrIntegration = new VCRIntegration(config);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    // first item should be accepted
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    // further items should be refused
    vcrIntegration.addToQueue('https://wwww.clarin.eu/2', 'test2');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    vcrIntegration.addAllToQueue([
        { url: 'https://wwww.clarin.eu/3', title: 'test3' },
        { url: 'https://wwww.clarin.eu/4', title: 'test4' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});

test('Adding multiple beyond limit', () => {
    // set item limit to 1
    config[cfp.SETTING_MAX_ITEM_COUNT] = 1;
    const vcrIntegration = new VCRIntegration(config);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    // all items should be refused
    vcrIntegration.addAllToQueue([
        { url: 'https://wwww.clarin.eu/1', title: 'test1' },
        { url: 'https://wwww.clarin.eu/2', title: 'test2' }]);
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});
