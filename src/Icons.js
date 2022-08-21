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

import { icon } from '@fortawesome/fontawesome-svg-core'
// import individual icons to avoid including all icons
import {faCircleChevronUp,
        faCircleChevronDown,
        faTrash,
        faCircleQuestion
} from '@fortawesome/free-solid-svg-icons'

export const icons = {
    "hide": icon(faCircleChevronDown).html,
    "show": icon(faCircleChevronUp).html,
    "remove": icon(faTrash).html,
    "help": icon(faCircleQuestion).html
}
