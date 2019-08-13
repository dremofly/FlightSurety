import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json'
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
require('babel-polyfill')
const bodyParser = require('body-parser')

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
const flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

var oraclesList = [];
var gasLimit = 4712388;
var gasPrice = 100000000000;

(async function initializeApp() {


  flightSuretyApp.events.OracleRequest()
    .on('error', error => { console.log(error) })
    .on('data', async data => {
      console.log("****************** oracle request received ******************")
      const airline = data.returnValues.airline;
      const flight = data.returnValues.flight;
      const timestamp = data.returnValues.timestamp;
      console.log("timestamp", timestamp)
      await submitOracleResponses(flight, airline, timestamp)
    })

  flightSuretyApp.events.OracleReport()
    .on('error', error => {console.log(error) })
    .on('data', async data => {
      console.log("*************** oracle report ******************")
    })

  flightSuretyApp.events.FlightStatusInfo()
    .on('error', error => {console.log(error)})
    .on('data', async data => {
      console.log("********************* Flight Status Info **************")
      const index = data.returnValues.index;
      const airline = data.returnValues.airline;
      const flight = data.returnValues.flight;
      const timestamp = data.returnValues.timestamp;
      console.log(`Flight Info: index(${index}), airline(${airline}), flight(${flight}), timestamp(${timestamp})`)
    })

    flightSuretyData.events.FlightStatusUpdated()
    .on('error', error => {console.log(error)})
    .on('data', async data => {
      console.log("****************** FlightStatusUpdated ******************")
    })

    flightSuretyData.events.AmountRefundedToPassengerBalance()
      .on('error', error => {console.log(error)})
      .on('data', async data => {
        console.log("****************** AmountRefundedToPassengerBalance ******************")
      })

  var accountsList = await web3.eth.getAccounts()
  console.log("AccountsList length: ", JSON.stringify(accountsList.length))

  console.log("registering oracles...")
  accountsList.slice(Math.max(accountsList.length-5,1))
  .forEach(async account => {
    try {
      await flightSuretyApp.methods.registerOracle().send({
        from: account,
        value: web3.utils.toWei('1', 'ether'),
        gas: gasLimit, 
        gasPrice: gasPrice
      })
      oraclesList.push(account)
      console.log('registered oracle: ' + account);
    } catch(error) {
      console.log('oracle error: ' + error.message)
    }
  })

})();

//  flightSuretyApp.events.OracleRequest({
//    fromBlock: 0
//  }, async function (error, event) {
//    if (error) console.log(error)
//    console.log('OracleRequest')
//    console.log(event.returnValues.airline)
//    const airline = event.returnValues.airline;
//    const flight = event.returnValues.flight;
//    const timestamp = event.returnValues.timestamp;
//    await submitOracleResponses(flight, airline, timestamp)
//});

let submitOracleResponses = async function (flight, airline, timestamp) {
  console.log(`flight: ${flight}, airline: ${airline}, time: ${timestamp}`)
  console.log(`oracles list count: ${oraclesList.length}, submitting responses....`)
  oraclesList.forEach(async oracle => {
    console.log(`oracle: ${oracle}, fetching indexes`)
    const oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({
      from: oracle,
      gas: gasLimit,
      gasPrice: gasPrice
    })
    console.log(`oracle: ${oracle}, index: ${oracleIndexes}`)
    oracleIndexes.forEach(async index => {
      const statusCode = 20//getRandomInt(3) * 10
      try {
        console.log(`oracle : ${oracle}, index: ${index}, code: ${statusCode}`)
        await flightSuretyApp.methods.submitOracleResponse(
          index,
          airline,
          flight,
          timestamp,
          statusCode
        ).send({
          from: oracle,
          gas: gasLimit,
          gasPrice: gasPrice
        })
      } catch (err) { //console.log(err) 
      }
    })
  })
};



//flightSuretyApp.events.OracleReport({
//  fromBlock: 0
//}, async function (error, event) {
//  if(error) console.log(error)
//  console.log(OracleReport)
//});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;