/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/VCRIntegration.js":
/*!*******************************!*\
  !*** ./src/VCRIntegration.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"VCRIntegration\": () => (/* binding */ VCRIntegration)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\n\n/* \n * Copyright (C) 2022 CLARIN\n *\n * This program is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License as published by\n * the Free Software Foundation, either version 3 of the License, or\n * (at your option) any later version.\n *\n * This program is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with this program.  If not, see <http://www.gnu.org/licenses/>.\n */\nvar queueViewTemplate = function queueViewTemplate(config, collectionMetadata) {\n  if (!config) config = {};\n  if (!collectionMetadata) collectionMetadata = {};\n  var submitEndpoint = config.endpointUrl || 'https://beta-collections.clarin.eu/submit/extensional';\n  var name = collectionMetadata.name || config.defaultName || 'No name';\n  return \"\\n    <div id=\\\"vcrQueue\\\" style=\\\"position: fixed; top: 5px; right: 5px;\\n                                min-width: 30em; max-width: 50em;\\n                                z-index: 1000; padding: .5em 1em .5em .5em;\\n                                background: #fff; border: 1px solid #000;\\\">\\n        <h2>Items to submit to the VCR</h2>\\n        <form method=\\\"post\\\" action=\\\"\".concat(submitEndpoint, \"\\\">\\n            <input type=\\\"hidden\\\" name=\\\"name\\\" value=\\\"\").concat(name, \"\\\" />\\n            <ul style=\\\"0 0 0 1em\\\"></ul>\\n            <input id=\\\"submitVcrQueue\\\" type=\\\"submit\\\" value=\\\"Submit\\\" />\\n            <button id=\\\"clearVcrQueue\\\">Clear</button>\\n        </form>\\n    </div>\\n    \");\n};\n\nvar VCRIntegration = /*#__PURE__*/function () {\n  function VCRIntegration(config) {\n    _classCallCheck(this, VCRIntegration);\n\n    this.config = config;\n  }\n\n  _createClass(VCRIntegration, [{\n    key: \"getQueue\",\n    value: function getQueue() {\n      var queue = window.localStorage.getItem('vcrQueue');\n\n      if (queue) {\n        return JSON.parse(queue); //['content'];\n      } else {\n        return this.saveQueue([]);\n      }\n    }\n  }, {\n    key: \"saveQueue\",\n    value: function saveQueue(queue) {\n      window.localStorage.setItem('vcrQueue', JSON.stringify(queue)); //{'content': queue}));\n\n      return queue;\n    }\n  }, {\n    key: \"clearQueue\",\n    value: function clearQueue() {\n      window.localStorage.removeItem('vcrQueue');\n    }\n  }, {\n    key: \"getItemIndex\",\n    value: function getItemIndex(url) {\n      var queue = this.getQueue();\n\n      for (var i = 0; i < queue.length; i++) {\n        if (queue[i]['url'] === url) {\n          return i;\n        }\n      }\n\n      return -1;\n    }\n  }, {\n    key: \"removeFromQueue\",\n    value: function removeFromQueue(url) {\n      console.log('Remove from queue: ' + url);\n      var index = this.getItemIndex(url);\n\n      if (index >= 0) {\n        console.log('Remove item ' + index);\n        var queue = this.getQueue();\n        queue.splice(index, 1);\n        this.saveQueue(queue);\n        return true;\n      } else {\n        return false;\n      }\n    }\n  }, {\n    key: \"addToQueue\",\n    value: function addToQueue(url, title) {\n      if (this.getItemIndex(url) >= 0) {\n        console.log('URL already in queue');\n      } else {\n        var queue = this.getQueue();\n        queue.push({\n          'url': url,\n          'title': title\n        });\n        this.saveQueue(queue);\n        console.log('Queue: ');\n        console.dir(this.getQueue());\n        this.renderQueue();\n      }\n    }\n  }, {\n    key: \"renderQueue\",\n    value: function renderQueue() {\n      if ($(\"body #vcrQueue\").length) {\n        $(\"body #vcrQueue\").remove();\n      }\n\n      var queue = this.getQueue();\n\n      if (queue && queue.length > 0) {\n        $(\"body\").append(queueViewTemplate(this.config));\n        var list = $(\"#vcrQueue ul\");\n        queue.forEach(function (qi) {\n          var resourceUriValue = JSON.stringify({\n            \"uri\": qi['url'],\n            \"label\": qi['title']\n          }).replaceAll('\"', '&quot;');\n          list.append('<li data-vcr-url=\"' + qi['url'] + '\">' + qi['title'] + ' <a class=\"removeFromVcrQueue\" style=\"color: red; text-decoration: none;\" href=\"#\">X</a>' + ' <input type=\"hidden\" name=\"resourceUri\" value=\"' + resourceUriValue + '\" />' + '</li>');\n        });\n      }\n    }\n  }]);\n\n  return VCRIntegration;\n}();\n;\n\n//# sourceURL=webpack://vcr-integration/./src/VCRIntegration.js?");

/***/ }),

/***/ "./src/VCRIntegrationEventHandler.js":
/*!*******************************************!*\
  !*** ./src/VCRIntegrationEventHandler.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"VCRIntegrationEventHandler\": () => (/* binding */ VCRIntegrationEventHandler)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\n\n/* \n * Copyright (C) 2022 CLARIN\n *\n * This program is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License as published by\n * the Free Software Foundation, either version 3 of the License, or\n * (at your option) any later version.\n *\n * This program is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with this program.  If not, see <http://www.gnu.org/licenses/>.\n */\nvar VCRIntegrationEventHandler = /*#__PURE__*/function () {\n  function VCRIntegrationEventHandler(vcrIntegration) {\n    _classCallCheck(this, VCRIntegrationEventHandler);\n\n    this.vcrIntegration = vcrIntegration;\n    self = this;\n  }\n\n  _createClass(VCRIntegrationEventHandler, [{\n    key: \"handleClearQueueEvent\",\n    value: function handleClearQueueEvent() {\n      console.log('clear queue');\n      this.vcrIntegration.clearQueue();\n      this.vcrIntegration.renderQueue();\n    }\n  }, {\n    key: \"handleRemoveFromQueueEvent\",\n    value: function handleRemoveFromQueueEvent(event) {\n      console.log('remove from queue');\n      var url = $(event.target).parent().attr('data-vcr-url');\n\n      if (this.vcrIntegration.removeFromQueue(url)) {\n        this.vcrIntegration.renderQueue();\n      }\n    }\n  }, {\n    key: \"handleAddToQueueEvent\",\n    value: function handleAddToQueueEvent(event) {\n      var url = $(event.target).attr('data-vcr-url');\n      var title = $(event.target).attr('data-vcr-title');\n\n      if (url) {\n        this.vcrIntegration.addToQueue(url, title); // TODO: disable buttons of items that are already in queue\n      }\n    }\n  }]);\n\n  return VCRIntegrationEventHandler;\n}();\n;\n\n//# sourceURL=webpack://vcr-integration/./src/VCRIntegrationEventHandler.js?");

/***/ }),

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _VCRIntegration_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./VCRIntegration.js */ \"./src/VCRIntegration.js\");\n/* harmony import */ var _VCRIntegrationEventHandler_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./VCRIntegrationEventHandler.js */ \"./src/VCRIntegrationEventHandler.js\");\n/* \n * Copyright (C) 2022 CLARIN\n *\n * This program is free software: you can redistribute it and/or modify\n * it under the terms of the GNU General Public License as published by\n * the Free Software Foundation, either version 3 of the License, or\n * (at your option) any later version.\n *\n * This program is distributed in the hope that it will be useful,\n * but WITHOUT ANY WARRANTY; without even the implied warranty of\n * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n * GNU General Public License for more details.\n *\n * You should have received a copy of the GNU General Public License\n * along with this program.  If not, see <http://www.gnu.org/licenses/>.\n */\n\n\n\nvar init_plugin = function init_plugin() {\n  //TODO: read configuration\n  vcrIntegration = new _VCRIntegration_js__WEBPACK_IMPORTED_MODULE_0__.VCRIntegration({});\n  var eventHandler = new _VCRIntegrationEventHandler_js__WEBPACK_IMPORTED_MODULE_1__.VCRIntegrationEventHandler(vcrIntegration);\n  $(\"body\").on(\"click\", \"#vcrQueue #clearVcrQueue\", $.proxy(eventHandler.handleClearQueueEvent, eventHandler));\n  $(\"body\").on(\"click\", \"#vcrQueue li[data-vcr-url] a.removeFromVcrQueue\", $.proxy(eventHandler.handleRemoveFromQueueEvent, eventHandler)); // if auto registration of handlers enabled\n\n  if ($(\"a[data-vcr-url]\").length) {\n    console.log(\"Found one or more VCR queue item controls: \" + $(\"a[data-vcr-url]\").length); // TODO: render 'add to queue' buttons where placeholders are defined\n    // bind event to add to queue\n\n    $(\"body\").on(\"click\", \"a[data-vcr-url]\", $.proxy(eventHandler.handleAddToQueueEvent, eventHandler));\n  }\n\n  var queue = vcrIntegration.getQueue();\n\n  if (queue) {\n    vcrIntegration.renderQueue();\n  }\n}; // global VCRIntegration object\n\n\nvar vcrIntegration = null; // init when document ready\n\n$(document).ready(init_plugin);\n\n//# sourceURL=webpack://vcr-integration/./src/main.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.js");
/******/ 	
/******/ })()
;