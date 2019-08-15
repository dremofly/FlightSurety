import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json'
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];        
        //this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        //await window.ethereum.enable();
        //this.web3 = null;
        this.initialize(config, callback);
        //this.web3 = new Web3(window.ethereum);
        
    }

    async initialize(config, callback) {
        
        await window.ethereum.enable()
        console.log("here")
        this.web3 = new Web3(window.ethereum)
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];
            console.log("account: ", accts[0])

            let counter = 1;
            
            //while(this.airlines.length < 5) {
            //    this.airlines.push(accts[counter++]);
            //}

            //while(this.passengers.length < 5) {
            //    this.passengers.push(accts[counter++]);
            //}
            this.airlines.push(config.firstAirline)
            console.log(this.airlines)
            console.log(this.passengers)
        
        });
        //console.log(this.flightSuretyData.methods)
        //let li = await this.flightSuretyData.methods.getAllAirlines().call()

        //console.log("airlines", li)

        //let fi = await this.flightSuretyData.methods.getAllFlights().call()
        //console.log("flight key: ", fi)

        //let fi2 = await this.flightSuretyData.methods.flights(fi[0]).call()
        //console.log("flight: ", fi2)
        //let one = await this.flightSuretyData.methods.airlines(li[0]).call()
        //console.log("a airline", one )
        callback();
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    // 得到airline的数量
    async getAirlineCount(callback) {
        let self = this;
        console.log("get airline count")
        console.log(self.flightSuretyData.methods)
        self.flightSuretyData.methods
            .getRegisteredAirlinesCount()
            .call({ from: self.owner}, (err, res) => {
                console.log(res)
                callback(err, res)
            })
    }

    async registerAirline(airline, name, callback) {
        console.log("register airline")
        let self = this;

        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        console.log("typeof account", typeof(account))

        self.flightSuretyApp.methods
            .registerAirline(airline, name)
            .send({from: account}, (err, result) => {
                callback(err, result)
            });
        
    }

    async fundAirline(airline, callback) {
        let self = this;
        console.log("fund")
        //let account = self.web3.eth.getAccounts().then(console.log);
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        console.log(account) 
        
        self.flightSuretyApp.methods.fund()
            .send({from: account, value: Web3.utils.toWei('10', 'ether')}, (err, res) => {
            callback(err, res)
        })
    }

    async registerFlight(flight_num, flight_time, callback) {
        let self = this;
        console.log("Register flight")
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        console.log(account)

        self.flightSuretyApp.methods.registerFlight(flight_num, flight_time)
            .send({from: account}, (err, res) => {callback(err, res)})
    }

    async getFlight(callback) {
        let self = this;
        //let flights = await self.flightSuretyData.methods.getAllFlights().call();
        let key = await self.flightSuretyData.methods.getAllFlights().call()
        let name = []
        for(let i=0; i<key.length; i++) {
            let flight = await this.flightSuretyData.methods.flights(key[i]).call()
            name.push(flight.flight)
            console.log(flight)
        }
        callback(null, name)
    }

    async getFlightInfo(flight, callback) {
        let self = this;
        let key = await self.flightSuretyData.methods.getAllFlights().call()
        console.log("input flight: ", flight)
        for(let i=0; i<key.length; i++) {
            let item = await this.flightSuretyData.methods.flights(key[i]).call()
            console.log(item)
            if(item.flight == flight) {
                
                callback(null, item)
            }
        }
    }

    async buyInsurance(airline, flight, timestamp, amount, callback) {
        let self = this;
        console.log("buy insurance")
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        console.log(account)
        console.log(typeof(airline))
        console.log(typeof(flight))
        timestamp = parseInt(timestamp)
        console.log(typeof(timestamp))
        
        console.log(amount)
        console.log(typeof(amount))
        self.flightSuretyApp.methods
            .buy(airline, flight, timestamp)
            //.buy("0x9E67c0728A8A98ADc3c067c07539b7C3f41E94Cc", "flight1", 1523523534)
            .send({from: account, value: Web3.utils.toWei('0.1', 'ether')}, 
            (err, res) => {
                if(err) console.log(err)
                callback(err, res)
            })
        
        

    }


    async fetchFlightStatus(airline, flight, timestamp, callback) {
        console.log("fetch flight status")
        let self = this;  
        //let payload = {
        //    airline: "0x9E67c0728A8A98ADc3c067c07539b7C3f41E94Cc",
        //    flight: "flight2",
        //    //timestamp: Math.floor(Date.now() / 1000)
        //    timestamp: 1523523534
        //} 
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        self.flightSuretyApp.methods
            .fetchFlightStatus(airline, flight, timestamp)
            .send({ from: account}, (error, result) => {
                callback(error, result);
            });
    }

    async getPassengerBalance(callback) {
        console.log("get passenger balance")
        let self = this
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        self.flightSuretyData.methods
            .passengersBalances(account)
            .call((error, result) => {
                callback(error, result)
            })
    }

    // 获取某个airline的passenger的balance
    async getPassengerInsuredAmount(airline, flight, timestamp, callback) {
        console.log("get passenger insured Amount")
        let self = this
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        timestamp = parseInt(timestamp)
        self.flightSuretyData.methods
            .getPassengerInsuredAmount(airline, flight, timestamp, account)
            //.getPassengerInsuredAmount("0x9E67c0728A8A98ADc3c067c07539b7C3f41E94Cc", "flight1", 1523523534, "0xFafe970073235B000838eD1FB6321D6DaC9058E9")
            .call((error, result) => {
                callback(error, result)
            })
    }

    // withdraw function
    async withdraw(amount, callback) {
        console.log("Withdraw")
        let self = this
        let accounts = await self.web3.eth.getAccounts()
        let account = accounts[0]
        //let price = Web3.utils.toWei(amount)
        self.flightSuretyApp.methods
            .pay(account)
            .send({from: account, gas: 8000000}, (error, result) => {
                callback(error, result)
            })
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