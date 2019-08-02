import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        console.log(this.flightSuretyApp.methods)
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
    }

    registerOracle(callback) {
       let self = this;
       let accounts = [
           "0x042abC877B640B26d576aA8913D56DfB2C5F65Af",
           "0xaf165B4F6907e43082716096f92467AFDf3448dE",
           "0xeE94388B44FfA593D21dc669eD7c3aB0D5ea4965",
           "0xa7C1faCa8e09785e7621386C1730c80D98Bed0fA",
           "0x53fB36Dadd33C8aF4703CbE8C6A3eEDb5c0eD8e0",
           "0x218768ec337aFF7443133D749E0c2d6FA5Ba48f1",
           "0x89AF83AB6EF2A2Ef1D55b1d4bE0Db3EeD3db3a29",
           "0xfAab9624dBbeE07Ef6EcA56Ac11088B73C5CEE01",
           "0x434d6E73F6B021dcA621098446657917321F3e6E",
           "0xBeC97258fCF0d7b7bc1e080537486E7944A2fD52",
           "0x5927Cec075631d3f47b717ce7d14245dD15de485",
           "0x813D0A8c2e4fD030FED9e16D9F1c57751E333D76",
           "0xA63073B1188CAE0B9B5305484682E82EB89fa042",
           "0xa1869449B75675d4E5EB2e238d60C53a982016A4",
           "0x4934f9E1a0D42C9569A295d40789829d5Dced175",
           "0x11F8C98f114A58cE9C739333db4f062A6f0BbcDe",
           "0xA7575fbCf9A3d8ED80822b5a5AF43E99cAE0eb92",
           "0x7E6Ae490A4177c19236C2d915344Bb9B67e68667",
           "0x8924B380A1135228bb699bDbAa3C65EBC3b46a21",
           "0x1f2f565bc54Ecd35a1cd7419f45dAAf5e01463b1"
       ];
       
       for(let i=0; i<accounts.length; i++) {
           self.flightSuretyApp.methods
               .registerOracle().send({from: accounts[i], value: Web3.utils.toWei('1', 'ether')}, (error, result) => {
                   console.log(`oracle regitered: ${accounts[i]}`)
               });
          
       }
        console.log('register oracles')
        
        callback();
    }
}