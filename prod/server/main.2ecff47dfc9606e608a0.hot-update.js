exports.id = "main";
exports.modules = {

/***/ "./src/server/server.js":
/*!******************************!*\
  !*** ./src/server/server.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../build/contracts/FlightSuretyApp.json */ \"./build/contracts/FlightSuretyApp.json\");\nvar _build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../build/contracts/FlightSuretyApp.json */ \"./build/contracts/FlightSuretyApp.json\", 1);\n/* harmony import */ var _build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../build/contracts/FlightSuretyData.json */ \"./build/contracts/FlightSuretyData.json\");\nvar _build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../../build/contracts/FlightSuretyData.json */ \"./build/contracts/FlightSuretyData.json\", 1);\n/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config.json */ \"./src/server/config.json\");\nvar _config_json__WEBPACK_IMPORTED_MODULE_2___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./config.json */ \"./src/server/config.json\", 1);\n/* harmony import */ var web3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! web3 */ \"web3\");\n/* harmony import */ var web3__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(web3__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_4__);\n\n\n\n\n\n\n__webpack_require__(/*! babel-polyfill */ \"babel-polyfill\");\n\nconst bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\");\n\nlet config = _config_json__WEBPACK_IMPORTED_MODULE_2__['localhost'];\nlet web3 = new web3__WEBPACK_IMPORTED_MODULE_3___default.a(new web3__WEBPACK_IMPORTED_MODULE_3___default.a.providers.WebsocketProvider(config.url.replace('http', 'ws')));\nweb3.eth.defaultAccount = web3.eth.accounts[0];\nlet flightSuretyApp = new web3.eth.Contract(_build_contracts_FlightSuretyApp_json__WEBPACK_IMPORTED_MODULE_0__.abi, config.appAddress);\nconst flightSuretyData = new web3.eth.Contract(_build_contracts_FlightSuretyData_json__WEBPACK_IMPORTED_MODULE_1__.abi, config.dataAddress); // define necessary variables\n\nlet oracleList = [],\n    flightsList = [],\n    flightStatus = {\n  '0': 'unknown',\n  '10': 'on time',\n  '20': 'late due to the airline'\n},\n    gasLimit = 4712388,\n    gasPrice = 100000000000;\n/********************************************************************************************/\n\n/*                                       FUNCTION                                        */\n\n/********************************************************************************************/\n\nlet getRandomInt = function (max) {\n  return Math.floor(Math.random() * Math.floor(max));\n}; // 从调用APP合约中的方法，将oracle要求的值返回。\n\n\nlet submitOracleResponses = async function (flight, airline, timestamp) {\n  console.log(`flight: ${flight}, airline: ${airline}, time: ${timestamp}`);\n  console.log(`oracles list count: ${oraclesList.length}, submitting responses...`);\n  oracleList.forEach(async oracle => {\n    console.log(`oracle: ${(oracle, fetching, indexes)}`);\n    const oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({\n      from: oracle,\n      gas: gasLimit,\n      gasPrice: gasPrice\n    });\n    console.log(`oracle: ${oracle}, index: ${oracleIndexes}`);\n    oracleIndexes.forEach(async index => {\n      const statusCode = 20;\n\n      try {\n        console.log(`oracle: ${oracle}, index: ${index}, code: ${statusCode}`);\n        await flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({\n          from: oracle,\n          gas: gasLimit,\n          gasPrice: gasPrice\n        });\n      } catch (err) {\n        console.log(err);\n      }\n    });\n  });\n};\n\nlet fetchFlights = async function () {\n  flightsList = [];\n\n  try {\n    const flights = await flightSuretyData.methods.flights().call();\n    flights.forEach(f => flightsList.push({\n      isRegistered: f.isRegistered,\n      statusCode: f.statusCode,\n      airline: f.airline,\n      flight: f.flight\n    }));\n  } catch (error) {}\n};\n/********************************************************************************************/\n\n/*                                       LIFE                                        */\n\n/********************************************************************************************/\n\n\n(async function initializeApp() {\n  flightSuretyApp.events.FlightRegistered().on('data', async data => {\n    const f = await flightSuretyData.methods.flights(data.returnValues.flightKey).call();\n    flightsList.push({\n      isRegistered: f.isRegistered,\n      statusCode: f.statusCode,\n      airline: f.airline,\n      flight: f.flight,\n      timestamp\n    });\n  }).on('error', console.log);\n  flightSuretyApp.events.OracleRequest().on('error', async => {\n    console.log(error);\n  }).on('data', async data => {\n    //  如果监测到OracleRequest这个event，就会有一下几个数据\n    const airline = data.returnValues.airline;\n    const flight = data.returnValues.flight;\n    const timestamp = data.returnValues.timestamp;\n    await submitOracleResponses(flight, airline, timestamp);\n  });\n  flightSuretyApp.events.FlightStatusInfo().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log('FlightStatusToPassengerBalance: ' + JSON.stringify(data));\n  });\n  flightSuretyData.events.FlightStatusUpdated().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log('FLightStatusUpdated: ' + JSON.stringify(data));\n  });\n  flightSuretyData.events.AmountRefundedToPassengerBalance().on('error', error => {\n    console.log(error);\n  }).on('data', async data => {\n    console.log('AmountRefundedToPassengerBalance: ' + JSON.stringify(data));\n  });\n  console.log('call authorizeAppContract....');\n  await flightSuretyData.methods.authorizeAppContract(flightSuretyApp._address);\n  let flightTimestamp = Math.floor(Data.now() / 1000);\n  flightSuretyApp.methods.registerFlight(\"ND1309\", flightTimestamp).send({\n    from: config.firstAirline,\n    gas: gasLimit,\n    gasPrice: gasPrice\n  });\n  console.log(\"registerFlight done...\");\n  let accountsList = await web3.eth.getAccounts();\n  console.log(\"accountsList res: \" + JSON.stringify(accountsList.length));\n  console.log(\"registering oracles: \");\n  accountsList.slice(Math.max(accountsList.length - 20, 1)).forEach(async account => {\n    try {\n      await flightSuretyApp.methods.registerOracle().send({\n        from: account,\n        value: web3.utils.toWei('1', 'ether'),\n        gas: gasLimit,\n        gasPrice: gasPrice\n      });\n      oraclesList.push(account);\n      console.log('registered oracle: ' + account);\n    } catch (error) {\n      console.log('oracle error: ', error.message);\n    }\n  });\n  fetchFlights();\n})(); // Express & Apis part\n\n\nconst app = express__WEBPACK_IMPORTED_MODULE_4___default()();\napp.use(bodyParser.json());\napp.use(express__WEBPACK_IMPORTED_MODULE_4___default.a.json()); // Add CORS middle-ware to allow for requests from other sites\n\napp.use(function (req, res, next) {\n  res.header('Access-Control-Allow-Origin', '*');\n  next();\n});\napp.get('/airplanes/flights', (req, res) => {\n  res.json(flightsList);\n});\napp.get('/passenger/:passenger/balance', async (req, res) => {\n  let balance = await flightSuretyData.methods.passengersBalances(req.params.passenger).call();\n  res.json({\n    balance: balance._hex,\n    passenger: req.params.passenger\n  });\n});\napp.get('/flight/:airline/:flightKey/:stamp', async (req, res) => {\n  let flightKey = await flightSuretyData.methods.getFlightKey(req.params.airline, req.params.flightKey, req.params.stamp).call();\n  let flight = await flightSuretyData.methods.flights(flightKey).call();\n  res.send(flight);\n});\napp.get('/flight/key/:flightKey', async (req, res) => {\n  let flight = await flightSuretyData.methods.flights(req.params.flightKey).call();\n  res.send(flight);\n});\napp.get('/flight/:airline/:flightKey/:stamp/response', async (req, res) => {\n  let flightKey = await flightSuretyData.methods.getFlightKey(req.params.airline, req.params.flightKey, req.params.stamp).call();\n  let responses = await flightSuretyApp.methods.oracleResponses(flightKey).call();\n  res.send(responses);\n});\napp.get('/flight/:airline/:flightKey/:stamp/pssenger/:passenger/ins/amount', async (req, res) => {\n  let amount = await flightSuretyData.methods.getPassengerInsuredAmount(req.params.airline, req.params.flightKey, req.params.stamp, req.params.passenger).call();\n  res.send(amount);\n});\n/* harmony default export */ __webpack_exports__[\"default\"] = (app);\n\n//# sourceURL=webpack:///./src/server/server.js?");

/***/ })

};