/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["BananaGLStyler"] = factory();
	else
		root["BananaGLStyler"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/styleWorker.ts":
/*!****************************!*\
  !*** ./src/styleWorker.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles */ \"./src/styles.ts\");\n/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three */ \"./node_modules/three/build/three.module.js\");\n\n\n\nfunction computeColorTable(style, metadataTable) {\n  var colorTable = new Map();\n\n  for (var obj in metadataTable) {\n    var color = style.apply(metadataTable[obj]);\n    colorTable.set(parseInt(obj), new three__WEBPACK_IMPORTED_MODULE_1__.Color().setHex(color));\n  }\n\n  return colorTable;\n}\n\nfunction computeColorBuffer(ids, colorTable) {\n  var colorBuffer = new Float32Array(ids.length);\n  var idBuffer = new Uint8Array(4);\n  var view = new DataView(idBuffer.buffer);\n  idBuffer[0] = 0;\n\n  var idToNumber = function idToNumber(offset) {\n    idBuffer[1] = ids[offset] * 255;\n    idBuffer[2] = ids[offset + 1] * 255;\n    idBuffer[3] = ids[offset + 2] * 255;\n    return view.getInt32(0);\n  };\n\n  var id, color;\n\n  for (var offset = 0; offset < ids.length; offset += 3) {\n    id = idToNumber(offset);\n    color = colorTable.get(id);\n\n    if (color) {\n      colorBuffer[offset] = color.r;\n      colorBuffer[offset + 1] = color.g;\n      colorBuffer[offset + 2] = color.b;\n    }\n  }\n\n  return colorBuffer;\n}\n\nfunction applyStyle(message) {\n  var _message$data = message.data,\n      jobID = _message$data.jobID,\n      data = _message$data.data;\n  var style = data.style,\n      ids = data.ids,\n      metadata = data.metadata;\n  var styleCls = _styles__WEBPACK_IMPORTED_MODULE_0__.Style.deserialize(style);\n  var colorTable = computeColorTable(styleCls, metadata);\n  var colorBuffer = computeColorBuffer(ids, colorTable);\n  var response = {\n    jobID: jobID,\n    result: {\n      color: colorBuffer\n    }\n  };\n  postMessage(response);\n} //eslint-disable-next-line no-restricted-globals\n\n\nself.onmessage = function (message) {\n  applyStyle(message);\n};\n\n//# sourceURL=webpack://BananaGLStyler/./src/styleWorker.ts?");

/***/ }),

/***/ "./src/styles.ts":
/*!***********************!*\
  !*** ./src/styles.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"Style\": () => (/* binding */ Style),\n/* harmony export */   \"StyleRuleAlways\": () => (/* binding */ StyleRuleAlways),\n/* harmony export */   \"StyleRuleAttributeEqualTo\": () => (/* binding */ StyleRuleAttributeEqualTo),\n/* harmony export */   \"StyleRuleAttributeRange\": () => (/* binding */ StyleRuleAttributeRange),\n/* harmony export */   \"StylerWorkerPool\": () => (/* binding */ StylerWorkerPool),\n/* harmony export */   \"deserialize\": () => (/* binding */ _deserialize),\n/* harmony export */   \"serialize\": () => (/* binding */ _serialize)\n/* harmony export */ });\n/* harmony import */ var _workerPool__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./workerPool */ \"./src/workerPool.ts\");\nfunction _typeof(obj) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && \"function\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }, _typeof(obj); }\n\nfunction _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== \"undefined\" && o[Symbol.iterator] || o[\"@@iterator\"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\"); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it[\"return\"] != null) it[\"return\"](); } finally { if (didErr) throw err; } } }; }\n\nfunction _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === \"string\") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === \"Object\" && o.constructor) n = o.constructor.name; if (n === \"Map\" || n === \"Set\") return Array.from(o); if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }\n\nfunction _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\n\nfunction _get() { if (typeof Reflect !== \"undefined\" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }\n\nfunction _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function\"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, \"prototype\", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }\n\nfunction _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }\n\nfunction _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === \"object\" || typeof call === \"function\")) { return call; } else if (call !== void 0) { throw new TypeError(\"Derived constructors may only return object or undefined\"); } return _assertThisInitialized(self); }\n\nfunction _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return self; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }\n\nfunction _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\n\nvar StylerWorkerPool = /*#__PURE__*/function (_WorkerPool) {\n  _inherits(StylerWorkerPool, _WorkerPool);\n\n  var _super = _createSuper(StylerWorkerPool);\n\n  function StylerWorkerPool() {\n    _classCallCheck(this, StylerWorkerPool);\n\n    return _super.call(this, StylerWorkerPool.workerPath, 5);\n  }\n\n  _createClass(StylerWorkerPool, [{\n    key: \"process\",\n    value: function process(data, callback) {\n      var serialized = data.style.serialize();\n\n      _get(_getPrototypeOf(StylerWorkerPool.prototype), \"process\", this).call(this, {\n        style: serialized,\n        metadata: data.metadata,\n        ids: data.ids\n      }, callback);\n    }\n  }], [{\n    key: \"Instance\",\n    get: function get() {\n      return this._instance || (this._instance = new this());\n    }\n  }]);\n\n  return StylerWorkerPool;\n}(_workerPool__WEBPACK_IMPORTED_MODULE_0__.WorkerPool);\n\n_defineProperty(StylerWorkerPool, \"workerPath\", 'styleWorker.js');\n\nvar StyleRule = /*#__PURE__*/_createClass(function StyleRule() {\n  _classCallCheck(this, StyleRule);\n});\n\nvar StyleRuleAlways = /*#__PURE__*/function (_StyleRule) {\n  _inherits(StyleRuleAlways, _StyleRule);\n\n  var _super2 = _createSuper(StyleRuleAlways);\n\n  function StyleRuleAlways() {\n    var _this;\n\n    _classCallCheck(this, StyleRuleAlways);\n\n    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n      args[_key] = arguments[_key];\n    }\n\n    _this = _super2.call.apply(_super2, [this].concat(args));\n\n    _defineProperty(_assertThisInitialized(_this), \"$type\", 'always');\n\n    return _this;\n  }\n\n  _createClass(StyleRuleAlways, [{\n    key: \"apply\",\n    value: function apply() {\n      return Math.random();\n    }\n  }]);\n\n  return StyleRuleAlways;\n}(StyleRule);\nvar StyleRuleAttributeEqualTo = /*#__PURE__*/function (_StyleRule2) {\n  _inherits(StyleRuleAttributeEqualTo, _StyleRule2);\n\n  var _super3 = _createSuper(StyleRuleAttributeEqualTo);\n\n  function StyleRuleAttributeEqualTo(props) {\n    var _this2;\n\n    _classCallCheck(this, StyleRuleAttributeEqualTo);\n\n    _this2 = _super3.call(this);\n\n    _defineProperty(_assertThisInitialized(_this2), \"$type\", 'attributeEqualTo');\n\n    _this2.attribute = props.attribute;\n    _this2.value = props.value;\n    return _this2;\n  }\n\n  _createClass(StyleRuleAttributeEqualTo, [{\n    key: \"apply\",\n    value: function apply(metadata) {\n      if (Object.prototype.hasOwnProperty.call(metadata, this.attribute) && metadata[this.attribute] == this.value) {\n        return 1;\n      }\n\n      return -1;\n    }\n  }]);\n\n  return StyleRuleAttributeEqualTo;\n}(StyleRule);\n\nfunction clamp(value, min, max) {\n  return Math.min(Math.max(value, min), max);\n}\n\nvar StyleRuleAttributeRange = /*#__PURE__*/function (_StyleRule3) {\n  _inherits(StyleRuleAttributeRange, _StyleRule3);\n\n  var _super4 = _createSuper(StyleRuleAttributeRange);\n\n  function StyleRuleAttributeRange(props) {\n    var _this3;\n\n    _classCallCheck(this, StyleRuleAttributeRange);\n\n    _this3 = _super4.call(this);\n\n    _defineProperty(_assertThisInitialized(_this3), \"$type\", 'attributeRange');\n\n    _this3.attribute = props.attribute;\n    _this3.min = props.min;\n    _this3.max = props.max;\n    return _this3;\n  }\n\n  _createClass(StyleRuleAttributeRange, [{\n    key: \"apply\",\n    value: function apply(metadata) {\n      if (Object.prototype.hasOwnProperty.call(metadata, this.attribute)) {\n        var value = metadata[this.attribute];\n        return clamp((value - this.min) / (this.max - this.min), 0, 1);\n      }\n\n      return -1;\n    }\n  }]);\n\n  return StyleRuleAttributeRange;\n}(StyleRule);\n\nfunction _serialize(rule) {\n  return JSON.stringify(rule);\n}\n\n\n\nfunction _deserialize(rule) {\n  var rule_ = JSON.parse(rule); //ugly but safe\n\n  switch (rule_.$type) {\n    case 'always':\n      return new StyleRuleAlways();\n\n    case 'attributeEqualTo':\n      return new StyleRuleAttributeEqualTo(rule_);\n\n    case 'attributeRange':\n      return new StyleRuleAttributeRange(rule_);\n\n    default:\n      throw new Error('Unknown rule type: ' + rule_.$type);\n  }\n}\n\n\nvar Style = /*#__PURE__*/function () {\n  function Style() {\n    var rules = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];\n    var defaultColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0xffffff;\n    var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0x00ffff;\n\n    _classCallCheck(this, Style);\n\n    this.rules = rules;\n    this.defaultColor = defaultColor;\n    this.color = color;\n  }\n\n  _createClass(Style, [{\n    key: \"forAll\",\n    value: function forAll() {\n      this.rules.push(new StyleRuleAlways());\n      return this;\n    }\n  }, {\n    key: \"withAttributeEqualTo\",\n    value: function withAttributeEqualTo(attribute, value) {\n      this.rules.push(new StyleRuleAttributeEqualTo({\n        attribute: attribute,\n        value: value\n      }));\n      return this;\n    }\n  }, {\n    key: \"withAttributeRange\",\n    value: function withAttributeRange(attribute, min, max) {\n      this.rules.push(new StyleRuleAttributeRange({\n        attribute: attribute,\n        min: min,\n        max: max\n      }));\n      return this;\n    }\n  }, {\n    key: \"useColor\",\n    value: function useColor(color) {\n      this.color = color;\n      return this;\n    }\n  }, {\n    key: \"useDefault\",\n    value: function useDefault(color) {\n      this.defaultColor = color;\n      return this;\n    }\n  }, {\n    key: \"lerpColor\",\n    value: function lerpColor(a, b, fade) {\n      var ar = a >> 16,\n          ag = a >> 8 & 0xff,\n          ab = a & 0xff,\n          br = b >> 16,\n          bg = b >> 8 & 0xff,\n          bb = b & 0xff,\n          rr = ar + fade * (br - ar),\n          rg = ag + fade * (bg - ag),\n          rb = ab + fade * (bb - ab);\n      return (rr << 16) + (rg << 8) + (rb | 0);\n    }\n  }, {\n    key: \"linearInterpolateColor\",\n    value: function linearInterpolateColor(colorHexMap, index) {\n      if (colorHexMap.length == 1) {\n        return colorHexMap[0];\n      }\n\n      var index0 = Math.floor(index * (colorHexMap.length - 1));\n      var index1 = Math.min(index0 + 1, colorHexMap.length - 1);\n      var fade = index - index0 / (colorHexMap.length - 1);\n      return this.lerpColor(colorHexMap[index0], colorHexMap[index1], fade);\n    }\n  }, {\n    key: \"sampleColor\",\n    value: function sampleColor(color, indicator) {\n      if (Array.isArray(color)) {\n        return this.linearInterpolateColor(color, indicator);\n      }\n\n      return color;\n    }\n  }, {\n    key: \"apply\",\n    value: function apply(metadata) {\n      var applyColorIndicator = Math.random();\n\n      var _iterator = _createForOfIteratorHelper(this.rules),\n          _step;\n\n      try {\n        for (_iterator.s(); !(_step = _iterator.n()).done;) {\n          var rule = _step.value;\n          applyColorIndicator = rule.apply(metadata);\n\n          if (applyColorIndicator < 0 || applyColorIndicator > 1) {\n            return this.sampleColor(this.defaultColor, Math.random());\n          }\n        }\n      } catch (err) {\n        _iterator.e(err);\n      } finally {\n        _iterator.f();\n      }\n\n      return this.sampleColor(this.color, applyColorIndicator);\n    }\n  }, {\n    key: \"serialize\",\n    value: function serialize() {\n      var style_ = {\n        rules: this.rules.map(_serialize),\n        defaultColor: this.defaultColor,\n        color: this.color\n      };\n      return JSON.stringify(style_);\n    }\n  }], [{\n    key: \"deserialize\",\n    value: function deserialize(style) {\n      var style_ = JSON.parse(style);\n      return new Style(style_.rules.map(_deserialize), style_.defaultColor, style_.color);\n    }\n  }]);\n\n  return Style;\n}();\n\n//# sourceURL=webpack://BananaGLStyler/./src/styles.ts?");

/***/ }),

/***/ "./src/workerPool.ts":
/*!***************************!*\
  !*** ./src/workerPool.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"WorkerPool\": () => (/* binding */ WorkerPool)\n/* harmony export */ });\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, \"prototype\", { writable: false }); return Constructor; }\n\nvar WorkerPool = /*#__PURE__*/function () {\n  function WorkerPool(workerPath, poolsize) {\n    var _this = this;\n\n    _classCallCheck(this, WorkerPool);\n\n    this.workers = [];\n    this.worker_busy = [];\n    this.jobIDs = 0;\n    this.resultMap = new Map();\n    this.poolsize = poolsize !== null && poolsize !== void 0 ? poolsize : 5;\n    console.log(workerPath);\n\n    var _loop = function _loop(i) {\n      _this.workers.push(new Worker(workerPath));\n\n      _this.worker_busy.push(false);\n\n      _this.workers[i].onmessage = function (message) {\n        var data = message.data;\n        var result = data.result,\n            jobID = data.jobID;\n\n        var res = _this.resultMap.get(jobID);\n\n        if (!res) return;\n        res.callback(result);\n        _this.worker_busy[i] = false;\n\n        _this.submit();\n      };\n    };\n\n    for (var i = 0; i < this.poolsize; ++i) {\n      _loop(i);\n    }\n\n    this.queue = [];\n  }\n\n  _createClass(WorkerPool, [{\n    key: \"worker\",\n    get: function get() {\n      for (var i = 0; i < this.poolsize; ++i) {\n        if (!this.worker_busy[i]) return i;\n      }\n\n      return undefined;\n    }\n  }, {\n    key: \"process\",\n    value: function process(data, callback) {\n      var jobID = this.jobIDs++;\n      this.resultMap.set(jobID, {\n        callback: callback\n      });\n      this.queue.push({\n        data: data,\n        jobID: jobID\n      });\n      this.submit();\n    }\n  }, {\n    key: \"submit\",\n    value: function submit() {\n      var i = this.worker;\n      if (i === undefined) return;\n      var job = this.queue.shift();\n      if (!job) return;\n      this.worker_busy[i] = true;\n      this.workers[i].postMessage(job);\n    }\n  }]);\n\n  return WorkerPool;\n}();\n\n//# sourceURL=webpack://BananaGLStyler/./src/workerPool.ts?");

/***/ }),

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/styleWorker.ts");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});