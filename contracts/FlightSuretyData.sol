pragma solidity >=0.4.25;

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    struct AirlineInfo {
        bool isRegistered;
        bool isFunded;
        string name;
        address[] approvedBy;
    }
    mapping(address => AirlineInfo) public airlines;
    address[] public airline_list;

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        string flight;
        address[] insuredPassengers;
        mapping(address => uint256) passengersPaymentAmount;
    }
    mapping(bytes32 => Flight) public flights;
    bytes32[] public flight_list;

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint256 public registeredAirlinesCount = 1; // TODO: 这里可以用private吗

    mapping(address => uint256) public passengersBalances;
    mapping(address => bool) public authorizedContracts;
    //mapping(address => uint256) public insurees;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/
    event FlightStatusUpdated(bytes32 flightKey, uint8 status, uint256 passengersCount);
    event AmountRefundedToPassengerBalance(address passenger, uint256 refundAmount);
    
    
    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirlineAddress
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        // TODO: 这里的其他信息应该也要从外界输入吧，比如name
        airlines[firstAirlineAddress] = AirlineInfo({
            isRegistered: true,
            isFunded: false,
            name: 'First Airline',
            approvedBy: new address[](0)
        });
        airline_list.push(firstAirlineAddress);
        registeredAirlinesCount = 1;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    // 检查address是否有效，不等于0
    modifier requireValidAddress(address a)
    {
        require(a!=address(0), "The address is not valid!");
        _;
    }


    //TODO: 使得只有apcontract可以调用这个datacontract
    modifier requireAuthorizedCaller() {
        require(authorizedContracts[msg.sender] == true, "The app contract is not authorized!");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner 
    {
        operational = mode;
    }

    // 根据modifier，这里需要设置。使得appcontract可以调用datacontract
    function authorizeAppContract(address contractAddress)
                                external 
                                requireIsOperational
                                requireContractOwner
    {
        authorizedContracts[contractAddress] = true;
    }

    // 判断airline是否已经注册了
    function isAirline(address airline) external returns(bool)
    {
        return airlines[airline].isRegistered;
    } 

    // TODO: 获取目前有多少的airline注册了
    function getRegisteredAirlinesCount() external returns(uint256)
    {
        return registeredAirlinesCount;
    }

    // TODO: 获取airline的信息
    function getAirlineInfo(address airline) external returns(bool isRegistered, bool isFunded, uint256 numOfApproved)
    {
        isRegistered = airlines[airline].isRegistered;
        isFunded = airlines[airline].isFunded;
        numOfApproved = airlines[airline].approvedBy.length;
    }

    // TODO: 获取允许某个airline注册的其他airline的列表。可以用来判断msg.sender是否已经同意了
    function getAirlineApprovalList(address airline) external returns(address[]) 
    {
        return airlines[airline].approvedBy;
    }

    // TODO: 获取某个passenger保险的数额
    function getPassengerInsuredAmount(address airline, string flight, uint256 timestamp, address passenger) external returns(uint256)
    {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        return flights[key].passengersPaymentAmount[passenger];
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */   
    function registerAirline
                            (   
                                address airline,
                                string name
                            )
                            external
                            requireIsOperational
                            requireValidAddress(airline)
    {
        airlines[airline].isRegistered = true;
        airlines[airline].name = name;
        registeredAirlinesCount = registeredAirlinesCount + 1;
        airline_list.push(airline);
    }


    // TODO: airline的approval列表里面添加新的airline
    function addToAirlineApprovalList(address airline, address approver) external
    {
        airlines[airline].approvedBy.push(approver);
    }

    function registerFlight (string flight, address airline, uint256 timestamp) external
    {
        // TODO: 前面两个过程是否可以调换
        // ****** 通过getFlightKey来获得key ****** 
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        // ****** 判断是否已经注册了 ******
        require(flights[flightKey].isRegistered == false, "This flight has been registered");
       // ****** 修改对应的key的flight的状态 ******
       flights[flightKey] = Flight({
            isRegistered: true,
            statusCode: STATUS_CODE_UNKNOWN,
            updatedTimestamp: timestamp,
            airline: airline,
            flight: flight,
            insuredPassengers: new address[](0)
       });
       flight_list.push(flightKey);
    }
    // TODO: 处理flight状态
    function processFlightStatus(bytes32 flightKey, uint8 statusCode) external 
    {
        // ******* 使用flightKey提取处对应的flight *******
        Flight memory flight = flights[flightKey];
        // ****** 判断这个flight是否满足已经注册了 ******       
        require(flight.isRegistered, "This flight hasn't been registered!");
        // ****** 更新statusCode ******   
        flights[flightKey].statusCode = statusCode;
        // ****** emit一个event ****** 
        emit FlightStatusUpdated(flightKey, statusCode, flight.insuredPassengers.length);
        // ****** 如果statusCode是20，也就是airline late了，就执行creditInsurees付钱给投保人 ****** 
        if (statusCode == 20) {
            creditInsurees(flightKey);
        }
    }

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (
                                bytes32 flightKey,          
                                address passenger                   
                            )   
                            external
                            payable
    {
        require(flights[flightKey].isRegistered, "This filight hasn't been registered!");

        flights[flightKey].passengersPaymentAmount[passenger] = uint256(msg.value);
        flights[flightKey].insuredPassengers.push(passenger);
    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    bytes32 flightKey
                                )
                                internal
    {
        Flight storage flight = flights[flightKey];
        require(flight.isRegistered, "This flight hasn't been registered!");

        for(uint i=0; i<flight.insuredPassengers.length; i++) {
            address passenger = flight.insuredPassengers[i];
            uint256 refundAmount = flight.passengersPaymentAmount[passenger].mul(3).div(2);
            emit AmountRefundedToPassengerBalance(passenger, refundAmount);
            passengersBalances[passenger] = passengersBalances[passenger].add(refundAmount);
        }
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                                address passenger
                            )
                            external
                            payable
    {
        require(passengersBalances[passenger]>=0, "This passenger has no balance.");

        uint256 value = passengersBalances[passenger];
        passengersBalances[passenger] = 0;
        passenger.transfer(value);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (   
                                address airline
                            )
                            public
                            payable
    {
        airlines[airline].isFunded = true;
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function getAllAirlines() external view returns(address[]) {
        return airline_list;
    }

    function getAllFlights() external view returns(bytes32[]) {
        return flight_list;
    }
    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        //TODO: 这个是什么函数来着
        fund(tx.origin);
    }


}

