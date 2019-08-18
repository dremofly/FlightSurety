var Test = require('../config/testConfig.js')
var BigNumber = require('bignumber.js')

contract('Flight Surety Tests', async (accounts) => {
    var config;
    var d = new Date();
    d.setDate(d.getDate()+3);
    var flightTime = d.getTime();
    // five accounts denotes five airlines. acount[1-5]

    before('setup contract', async () => {
        config = await Test.Config(accounts)
        await config.flightSuretyData.authorizeAppContract(config.flightSuretyApp.address);
    })

    it('Test isOperational()', async function () {
        let status = await config.flightSuretyData.isOperational.call();

        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it('[Airline] Test if I can call flightSuretyApp contract', async function () {
        let status = await config.flightSuretyApp.isOperational.call();

        assert.equal(status, true, "The app contract is not operational");
    });

    // register first airline
    it('[Airline] Register an airline', async () => {
        let fund = web3.utils.toWei('10', 'ether')
        console.log("Register an airline")
        await config.flightSuretyApp.fund({from:config.firstAirline, value:fund})
        console.log("Successfully fund")
        await config.flightSuretyApp.registerAirline(accounts[2], 'A2', {from: config.firstAirline});
        console.log("registered")
        let count = await config.flightSuretyData.getRegisteredAirlinesCount();
        assert(count, 2, "Successfully register second airline");
    });

    // register multiple airlines
    it('[Airline] Register multiple airlines', async () => {
        await config.flightSuretyApp.registerAirline(accounts[3], 'A3', {from: config.firstAirline});   // 3rd
        await config.flightSuretyApp.registerAirline(accounts[4], 'A4', {from: config.firstAirline});   // 4th
        // 接下来的需要投票才行
        await config.flightSuretyApp.registerAirline(accounts[5], 'A5', {from: config.firstAirline});

        let count = await config.flightSuretyData.getRegisteredAirlinesCount();
        assert(count, 4, "The 5th airline did not been registered, for it needs more votes")
    });

    // votes
    it('[Airline] Votes for the 5th airline', async () => {
        // fund former airlines
        let fund = web3.utils.toWei('10', 'ether')
        await config.flightSuretyApp.fund({from:accounts[2], value:fund})
        await config.flightSuretyApp.fund({from:accounts[3], value:fund})
        await config.flightSuretyApp.fund({from:accounts[4], value:fund})
        // votes for 5th
        await config.flightSuretyApp.registerAirline(accounts[5], 'A5', {from:accounts[2]})
        let count = await config.flightSuretyData.getRegisteredAirlinesCount();
        assert(count, 5, "The 5th airline is registered")
        
    });

    it('[Airline] Register a flight', async () => {
        
        let flightNum = 'D3238';
        
        await config.flightSuretyApp.registerFlight(flightNum, flightTime, {from: config.firstAirline});
    });  

    it('[Passenger] Buy insurance', async () => {
        let flightNum = 'D3238';
        let address = config.firstAirline;
        let amount = web3.utils.toWei('0.1', 'ether');

        await config.flightSuretyApp.buy(address, flightNum, flightTime, {from: accounts[7], value: amount});
    });

    it('[Oracle] Fetch flight status', async () => {
        let flightNum = 'D3238';
        let address = config.firstAirline;

        await config.flightSuretyApp.fetchFlightStatus(address, flightNum, flightTime);
    });

    it('[Passenger] Check payment amount', async () => {
        let flightNum = 'D3238';
        let address = config.firstAirline;

        await config.flightSuretyData.getPassengerInsuredAmount(address, flightNum, flightTime, accounts[7])
        
    })
});