
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {
    
    let result = null;
    
    let contract = new Contract('localhost', async () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    
        //await contract.registerOracle()
        contract.getAirlineCount((error, result) => {
            document.getElementById('airline-count').innerHTML = result
        })
        
        
        // Register Airline button function
        // input: "airline-address", "airline-name"
        DOM.elid('register-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            let name = DOM.elid('airline-name').value;
            console.log(airline)
            console.log(name)
            contract.registerAirline(airline, name, (error, result) => {
                //display('Register Airline', 'airline', 'nono')
                console.log(result, error)
            })
        })

        // Fund Airline function
        // input: "airline-address"
        DOM.elid('fund-airline').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').value;
            contract.fundAirline(airline, (error, result) => {
                if(error) console.log(error)
            })
        })

        // Register Flight function
        // input: "flight number", "flight time"
        DOM.elid('register-flight').addEventListener('click', () => {
            let flight_num = DOM.elid('flight-number').value;
            let flight_time = DOM.elid('flight-time').value;
            contract.registerFlight(flight_num, flight_time, (error, result) => {
                if(error) console.log(error)
            })
        })

        // Flight
        DOM.elid('get-flight').addEventListener('click', () => {
            contract.getFlight((error, result) => {
                if(error) console.log(error)
                //console.log(result) //flights result
                //let flights = DOM.elid('flights');
                let flights = document.getElementById('flights')
                
                
                // TODO: 清空下拉框
                for(let i=0; i<result.length; i++) {
                    
                    flights.add(new Option(result[i], i))
                }
            })


        })

        // listen to the event of select
        DOM.elid("flights").addEventListener("change", () => {
            console.log("change")
            let option = document.getElementById('flights')
            let index = option.selectedIndex
            console.log(index)
            
            console.log(option[index].text)
            contract.getFlightInfo(option[index].text, (err, result) => {
                if(err) console.log(err)
                let airline_address2 = document.getElementById("airline-address2")
                let flight_time2 = document.getElementById("flight-time2")
                airline_address2.innerHTML = result.airline
                flight_time2.innerHTML = result.updatedTimestamp
            })
        })

        DOM.elid("buy-insurance").addEventListener("click", () => {
            console.log("buy insurance")
            let amount = DOM.elid("insurance-amount").value
            let airline_address = document.getElementById("airline-address2").innerHTML
            let option = document.getElementById("flights")
            let index = option.selectedIndex
            let flight = option[index].text

            let flight_time = document.getElementById("flight-time2").innerHTML
            console.log(amount)
            console.log(airline_address)
            console.log(flight)
            console.log(flight_time)
            contract.buyInsurance(airline_address, flight, flight_time, amount, (err, result) => {
                if(err) console.log(err)

            })
        })

        // Pay insurance的get Flight
        DOM.elid("get-flight2").addEventListener("click", () => {
            console.log("get flight2")
            contract.getFlight((error, result) => {
                if(error) console.log(error)
                //console.log(result) //flights result
                //let flights = DOM.elid('flights');
                let flights = document.getElementById('flights2')
                
                
                // TODO: 清空下拉框
                for(let i=0; i<result.length; i++) {
                    
                    flights.add(new Option(result[i], i))
                }
            }) 
        })

        // listen to the event of the select
        DOM.elid("flights2").addEventListener("change", () => {
            console.log("change")
            let option = document.getElementById('flights2')
            let index = option.selectedIndex
            console.log(index)
            
            console.log(option[index].text)
            contract.getFlightInfo(option[index].text, (err, result) => {
                if(err) console.log(err)
                let airline_address2 = document.getElementById("airline-address3")
                let flight_time2 = document.getElementById("flight-time3")
                airline_address2.innerHTML = result.airline
                flight_time2.innerHTML = result.updatedTimestamp
            })
        })

        DOM.elid('check-flight-status').addEventListener('click', () => {
            
            let airline_address = document.getElementById("airline-address3").innerHTML
            let option = document.getElementById("flights2")
            let index = option.selectedIndex
            let flight = option[index].text 
            let flight_time = document.getElementById("flight-time3").innerHTML
            
            console.log(airline_address)
            console.log(flight)
            console.log(flight_time)
            // Write transaction
            contract.fetchFlightStatus(airline_address, flight, flight_time, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
        
        // get passenger balance
        DOM.elid('get-passenger').addEventListener('click', () => {
            contract.getPassengerBalance((error, result) => {
                if(error) console.log(error)
                console.log(result)
                alert("The passenger balance is " + result/1000000000000000000)
            })
        })

        // get passenger insured amount
        DOM.elid('get-passenger-insured-amount').addEventListener('click', () => {
            let airline_address = document.getElementById("airline-address3").innerHTML
            let option = document.getElementById("flights2")
            let index = option.selectedIndex
            let flight = option[index].text 
            let flight_time = document.getElementById("flight-time3").innerHTML

            contract.getPassengerInsuredAmount(airline_address, flight, flight_time, (error, result) => {
                if(error) console.log(error)
                console.log(result)
                alert("The insured amount is " + result/1000000000000000000)
            })
        })
        
        // withdraw
        DOM.elid('withdraw-btn').addEventListener('click', () => {
            let amount = DOM.elid("insurance-amount").value

            contract.withdraw(amount,   
                (error, result) => {
                    if(error) console.log(error)
                    console.log(result)
                }
            )
        })
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    let d = new Date()
    let d2 = Date.UTC(d.getUTCFullYear(),d.getUTCMonth() ,d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes(),d.getUTCSeconds());
    let date = new Date(d2);
    let content = title + ': ' + description + ' ' + date;
    section.appendChild(DOM.p(content))
    //section.appendChild(DOM.p(title));
    //section.appendChild(DOM.p(description));
    //results.map((result) => {
    //    let row = section.appendChild(DOM.div({className:'row'}));
    //    row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
    //    row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
    //    section.appendChild(row);
    //})
    displayDiv.append(section);

}







