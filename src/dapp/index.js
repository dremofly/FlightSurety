
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Statuss', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('register-oracle').addEventListener('click', () => {
            contract.registerOracle((error, result) => {
                if(error) console.log(error)
                //display('register', 'oracle register', 'status');
            });
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







