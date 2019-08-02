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
      const statusCode = 20;//getRandomInt(3) * 10
      try {
        console.log(`oracle : ${oracle}, index: ${index}, code: ${statusCode}`)
        await flightSuretyApp.methods.submitOracleResponse(
          index,
          airline,
          flight,
          +timestamp,
          statusCode
        ).send({
          from: oracle,
          gas: gasLimit,
          gasPrice: gasPrice
        })
      } catch (err) { console.log(err) }
    })
  })
};

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
  }, async function (error, event) {
    if (error) console.log(error)
    console.log('OracleRequest')
    console.log(event.returnValues.airline)
    const airline = event.returnValues.airline;
    const flight = event.returnValues.flight;
    const timestamp = event.returnValues.timestamp;
    await submitOracleResponses(flight, airline, timestamp)
});

flightSuretyApp.events.OracleReport({
  fromBlock: 0
}, async function (error, event) {
  if(error) console.log(error)
  console.log(OracleReport)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;