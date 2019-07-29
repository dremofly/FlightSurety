var Test = require('../config/testConfig.js')
var BigNumber = require('bignumber.js')

contract('Flight Surety Tests', async (accounts) => {
    var config;

    before('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    })

    it('Test isOperational()', async function () {
        let status = await config.flightSuretyData.isOperational.call();

        assert.equal(status, true, "Incorrect initial operating status value");
    });
});