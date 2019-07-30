var Test = require('../config/testConfig.js')
var BigNumber = require('bignumber.js')

contract('Flight Surety Tests', async (accounts) => {
    var config;
    // five accounts denotes five airlines. acount[1-5]

    before('setup contract', async () => {
        config = await Test.Config(accounts)
        await config.flightSuretyData.authorizeAppContract(config.flightSuretyApp.address);
    })

    it('Test isOperational()', async function () {
        let status = await config.flightSuretyData.isOperational.call();

        assert.equal(status, true, "Incorrect initial operating status value");
    });

    it('Test if I can call flightSuretyApp contract', async function () {
        let status = await config.flightSuretyApp.isOperational.call();

        assert.equal(status, true, "The app contract is not operational");
    });

    // register first airline
    it('Register an airline', async () => {
        let fund = web3.utils.toWei('1', 'ether')
        console.log("Register an airline")
        await config.flightSuretyApp.fund({from:config.firstAirline, value:fund})
        console.log("Successfully fund")
        await config.flightSuretyApp.registerAirline(accounts[2], 'A1', {from: config.firstAirline});
        console.log("registered")
        let count = await config.flightSuretyData.getRegisteredAirlinesCount();
        assert(count, 2, "Successfully register second airline");
    });

});