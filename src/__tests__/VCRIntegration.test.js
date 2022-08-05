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
import logger from 'loglevel';

beforeEach(() => {
    window.localStorage.clear();
});

test('Start with empty queue', () => {
    const vcrIntegration = new VCRIntegration({});
    expect(vcrIntegration.getQueue()).toHaveLength(0);
});

test('Adding item', () => {
    const vcrIntegration = new VCRIntegration({});
    expect(vcrIntegration.getQueue()).toHaveLength(0);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});

test('Adding same item twice, should only end up in queue once', () => {
    const vcrIntegration = new VCRIntegration({});
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
    vcrIntegration.addToQueue('https://wwww.clarin.eu/1', 'test1');
    expect(vcrIntegration.getQueue()).toHaveLength(1);
});

test('Removing items', () => {
    const vcrIntegration = new VCRIntegration({});
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
