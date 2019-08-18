
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  
  
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });
  

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    

    // ARRANGE
    //let newAirline = accounts[2];
    let i = 0;
    while(i<5) {
        // ACT
        await config.flightSuretyApp.registerAirline(accounts[i+1], 'A1', {from: accounts[0]});
 //       try {
 //           await config.flightSuretyApp.registerAirline(account[i+1], 'A1', {from: accounts[0]});
 //       }
 //       catch(e) {
 //           console.log("fail")
 //       }
        i++;
    }
    
    let airlineCounts = await config.flightSuretyApp.getAirlineCounts();
    let count = airlineCounts.toNumber()
    console.log(count)
    //let result = await config.flightSuretyData.isAirline.call(newAirline); 


    // ASSERT
    //assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");
    assert.equal(count, 4, "The fifth airline can not register")
  });
 
    //添加consensus mechanism
    it('(airline) consensus mechanism', async () => {
        let i = 0;
        let votes = 0;
        let airlineCounts = await config.flightSuretyApp.getAirlineCounts();
        let count = airlineCounts.toNumber()
        console.log(count)
        await config.flightSuretyApp.registerAirline(accounts[5], 'A1', {from: accounts[1]}).then(function(res){
            votes=res[1]
        })
        airlineCounts = await config.flightSuretyApp.getAirlineCounts();
        count = airlineCounts.toNumber()
        console.log(count)
        
        await config.flightSuretyApp.registerAirline(accounts[5], 'A1', {from: accounts[2]})
        airlineCounts = await config.flightSuretyApp.getAirlineCounts();
        count = airlineCounts.toNumber()
        console.log(count)

        await config.flightSuretyApp.registerAirline(accounts[5], 'A1', {from: accounts[3]})

        airlineCounts = await config.flightSuretyApp.getAirlineCounts();
        count = airlineCounts.toNumber()
        console.log(count)
    });

});
