exports.id = "main";
exports.modules = {

/***/ "./build/contracts/FlightSuretyApp.json":
false,

/***/ "./build/contracts/FlightSuretyData.json":
false,

/***/ "./src/server/config.json":
false,

/***/ "./src/server/index.js":
/*!*****************************!*\
  !*** ./src/server/index.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! http */ \"http\");\n/* harmony import */ var http__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(http__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./server */ \"./src/server/server.js\");\n/* harmony import */ var _server__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_server__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst server = http__WEBPACK_IMPORTED_MODULE_0___default.a.createServer(_server__WEBPACK_IMPORTED_MODULE_1___default.a);\nlet currentApp = _server__WEBPACK_IMPORTED_MODULE_1___default.a;\nserver.listen(3000);\n\nif (true) {\n  module.hot.accept(/*! ./server */ \"./src/server/server.js\", function(__WEBPACK_OUTDATED_DEPENDENCIES__) { /* harmony import */ _server__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./server */ \"./src/server/server.js\");\n/* harmony import */ _server__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_server__WEBPACK_IMPORTED_MODULE_1__);\n(() => {\n    server.removeListener('request', currentApp);\n    server.on('request', _server__WEBPACK_IMPORTED_MODULE_1___default.a);\n    currentApp = _server__WEBPACK_IMPORTED_MODULE_1___default.a;\n  })(__WEBPACK_OUTDATED_DEPENDENCIES__); }.bind(this));\n}\n\n//# sourceURL=webpack:///./src/server/index.js?");

/***/ }),

/***/ "./src/server/server.js":
/*!******************************!*\
  !*** ./src/server/server.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\n\n//# sourceURL=webpack:///./src/server/server.js?");

/***/ }),

/***/ "babel-polyfill":
false,

/***/ "body-parser":
false,

/***/ "express":
false,

/***/ "web3":
false

};