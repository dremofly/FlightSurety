exports.id = "main";
exports.modules = {

/***/ "./src/server/server.js":
/*!******************************!*\
  !*** ./src/server/server.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../build/contracts/FlightSuretyApp.json */ \"./build/contracts/FlightSuretyApp.json\");\nvar _build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../build/contracts/FlightSuretyApp.json */ \"./build/contracts/FlightSuretyApp.json\", 1);\n/* harmony import */ var _build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../build/contracts/FlightSuretyData.json */ \"./build/contracts/FlightSuretyData.json\");\nvar _build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../build/contracts/FlightSuretyData.json */ \"./build/contracts/FlightSuretyData.json\", 1);\n/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config.json */ \"./src/server/config.json\");\nvar _config_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./config.json */ \"./src/server/config.json\", 1);\n/* harmony import */ var web3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! web3 */ \"web3\");\n/* harmony import */ var web3__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(web3__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n\n__webpack_require__(/*! babel-polyfill */ \"babel-polyfill\");\n\nconst bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\n\nlet config = _config_json__WEBPACK_IMPORTED_MODULE_2__['localhost'];\nlet web3 = new web3__WEBPACK_IMPORTED_MODULE_3___default.a(new web3__WEBPACK_IMPORTED_MODULE_3___default.a.providers.WebsocketProvider(config.url.replace('http', 'ws')));\nweb3.eth.defaultAccount = web3.eth.accounts[0];\nlet flightSuretyApp = new web3.eth.Contract(_build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0__.abi, config.appAddress);\nconst flightSuretyData = new web3.eth.Contract(_build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1__.abi, config.dataAddress);\nvar oraclesList = [];\nvar gasLimit = 4712388;\nvar gasPrice = 100000000000;\n\n(async function initializeApp() {\n  flightSuretyApp.events.OracleRequest().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log(\"****************** oracle request received ******************\");\n    const airline = data.returnValues.airline;\n    const flight = data.returnValues.flight;\n    const timestamp = data.returnValues.timestamp;\n    console.log(\"timestamp\", timestamp);\n    await submitOracleResponses(flight, airline, timestamp);\n  });\n  flightSuretyApp.events.OracleReport().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log(\"*************** oracle report ******************\");\n  });\n  flightSuretyApp.events.FlightStatusInfo().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log(\"********************* Flight Status Info **************\");\n    const index = data.returnValues.index;\n    const airline = data.returnValues.airline;\n    const flight = data.returnValues.flight;\n    const timestamp = data.returnValues.timestamp;\n    console.log(typeof index);\n    console.log(`Flight Info: index(${index}), airline(${airline}), flight(${flight}), timestamp(${timestamp})`);\n  });\n  var accountsList = await web3.eth.getAccounts();\n  console.log(\"AccountsList length: \", JSON.stringify(accountsList.length));\n  console.log(\"registering oracles...\");\n  accountsList.slice(Math.max(accountsList.length - 5, 1)).forEach(async account => {\n    try {\n      await flightSuretyApp.methods.registerOracle().send({\n        from: account,\n        value: web3.utils.toWei('1', 'ether'),\n        gas: gasLimit,\n        gasPrice: gasPrice\n      });\n      oraclesList.push(account);\n      console.log('registered oracle: ' + account);\n    } catch (error) {\n      console.log('oracle error: ' + error.message);\n    }\n  });\n})(); //  flightSuretyApp.events.OracleRequest({\n//    fromBlock: 0\n//  }, async function (error, event) {\n//    if (error) console.log(error)\n//    console.log('OracleRequest')\n//    console.log(event.returnValues.airline)\n//    const airline = event.returnValues.airline;\n//    const flight = event.returnValues.flight;\n//    const timestamp = event.returnValues.timestamp;\n//    await submitOracleResponses(flight, airline, timestamp)\n//});\n\n\nlet submitOracleResponses = async function (flight, airline, timestamp) {\n  console.log(`flight: ${flight}, airline: ${airline}, time: ${timestamp}`);\n  console.log(`oracles list count: ${oraclesList.length}, submitting responses....`);\n  oraclesList.forEach(async oracle => {\n    console.log(`oracle: ${oracle}, fetching indexes`);\n    const oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({\n      from: oracle,\n      gas: gasLimit,\n      gasPrice: gasPrice\n    });\n    console.log(`oracle: ${oracle}, index: ${oracleIndexes}`);\n    oracleIndexes.forEach(async index => {\n      const statusCode = 20; //getRandomInt(3) * 10\n\n      try {\n        console.log(`oracle : ${oracle}, index: ${index}, code: ${statusCode}`);\n        await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({\n          from: oracle,\n          gas: gasLimit,\n          gasPrice: gasPrice\n        });\n      } catch (err) {//console.log(err) \n      }\n    });\n  });\n}; //flightSuretyApp.events.OracleReport({\n//  fromBlock: 0\n//}, async function (error, event) {\n//  if(error) console.log(error)\n//  console.log(OracleReport)\n//});\n\n\nconst app = express__WEBPACK_IMPORTED_MODULE_4___default()();\napp.get('/api', (req, res) => {\n  res.send({\n    message: 'An API for use with your Dapp!'\n  });\n});\n/* harmony default export */ __webpack_exports__[\"default\"] = (app);\n\n//# sourceURL=webpack:///./src/server/server.js?");

/***/ })

};