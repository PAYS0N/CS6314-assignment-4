window.addEventListener("load", () => {
    setupFlightListeners();
    setupBookListeners()
    updateBookForm()
});

function setupBookListeners() {
    document.querySelector("#one-way-trip-radio").addEventListener("change", () => {
        updateBookForm()
    })
    document.querySelector("#round-trip-radio").addEventListener("change", () => {
        updateBookForm()
    })
}

function updateBookForm() {
    tripIsOneWay = document.querySelector("#one-way-trip-radio").checked
    tripIsRound = document.querySelector("#round-trip-radio").checked
    returnDateGroup = document.querySelector("#return-date-group")
    returnDate = document.querySelector("#return-date")
    if (tripIsOneWay) {
        returnDateGroup.style.display = 'none';
        returnDate.value = '';
        returnDate.required = false
    } else if (tripIsRound) {
        returnDateGroup.style.display = 'block';
        returnDate.required = true
    }

}

function submitBookForm(e) {
    e.preventDefault()
    const formData = new FormData(document.querySelector("#booking-form"));
    const origin = formData.get("origin")
    const destination = formData.get("destination")
    const departure = formData.get("depart-date")
    const returnDate = formData.get("return-date")
    const dateRegex = /^(2024-(09|10|11)-[0-3][0-9]|2024-12-01)$/
    const cityRegex = /^[A-Za-z\s]+,\s*(TX|CA)$/
    if (!cityRegex.test(origin)) {
        alert("Must start at a city in TX or CA.")
    }
    else if (!cityRegex.test(destination)) {
        alert("Must end at a city in TX or CA.")
    }
    else if (!dateRegex.test(departure)) {
        alert("Must depart from Sep 1, 2024 to Dec 1st, 2024.")
    }
    else if (returnDate && new Date(departure) > new Date(returnDate)) {
        alert("Must depart before return")
    }
    else if (returnDate != "") {
        if (!dateRegex.test(returnDate)) {
            alert("Must return from Sep 1, 2024 to Dec 1st, 2024.")
        }
        else {
            displayBookResults(origin, destination, departure, returnDate)
            return [origin, destination, departure, returnDate]
        }
    }
    else {
        displayBookResults(origin, destination, departure, returnDate)
        return [origin, destination, departure, returnDate]
    }
}

function displayBookResults(o, des, dep, arr) {
    const outputDiv = document.querySelector("#booking-output")
    outputDiv.textContent = "Origin: " + o + "\nDestination: " + des + "\nDeparture: " + dep
    if (arr != "") {
        outputDiv.textContent += "\nReturn: " + arr
    }
}

function setupFlightListeners() {
    document.querySelector("#passenger-icon").addEventListener("click", () => {
        document.querySelector("#flight-form").style.display = "block";
    });
    
    document.querySelector("#flight-form").addEventListener("submit", (e) => {
        let flightDetails = submitBookForm(e) 
        let passengerDetails = submitFlightForm(e) 
        if ( flightDetails && passengerDetails) {
            displayAvailableFlights(flightDetails, passengerDetails)
        }
    });
}

function displayFlightResults(adults, children, infants) {
    const outputDiv = document.querySelector("#flight-output");
    outputDiv.textContent =
        `Adults: ${adults}, Children: ${children}, Infants: ${infants}`;
}

function submitFlightForm(e) {
    e.preventDefault();
    const formData = new FormData(document.querySelector("#flight-form"));
    const adults = parseInt(formData.get("adults"), 10);
    const children = parseInt(formData.get("children"), 10);
    const infants = parseInt(formData.get("infants"), 10);

    const numRegex = /^[0-4]$/;

    if (!numRegex.test(adults) || !numRegex.test(children) || !numRegex.test(infants)) {
        alert("Number of passengers in any category cannot exceed 4.");
    }
    else {
        displayFlightResults(adults, children, infants);
        return [adults, children, infants]
    }
}

async function displayAvailableFlights(flightDetails, passengerDetails) {
    let [origin, destination, departure, returnDate] = flightDetails;
    let [adults, children, infants] = passengerDetails;
    
    document.querySelector("#flights-output").innerHTML = "";
    document.querySelector("#return-flights-output").innerHTML = "";
    
    const strOriginName = origin.trim().split(",")[0];
    const strDestName = destination.trim().split(",")[0];
    const totalPassengers = adults + children + infants;
    
    const isRoundTrip = returnDate && returnDate !== "";
    
    let depFound = false;
    let retFound = false;
    
    try {
        // Search for departure flights (exact date first)
        let depFlights = await searchFlights(strOriginName, strDestName, departure, totalPassengers, true);
        
        if (depFlights && depFlights.length > 0) {
            depFlights.forEach(flight => {
                addAFlight(flight, adults, children, infants, true, isRoundTrip);
            });
            depFound = true;
        }
        
        // Search for return flights if round trip (exact date first)
        if (isRoundTrip) {
            revealReturnFlightLabels();
            let retFlights = await searchFlights(strDestName, strOriginName, returnDate, totalPassengers, true);
            
            if (retFlights && retFlights.length > 0) {
                retFlights.forEach(flight => {
                    addAFlight(flight, adults, children, infants, false, isRoundTrip);
                });
                retFound = true;
            }
        } else {
            // One way trip, don't need return flight
            retFound = true;
        }
        
        // If exact dates not found, search within 3 days
        if (!depFound) {
            let depFlightsNear = await searchFlights(strOriginName, strDestName, departure, totalPassengers, false);
            
            if (depFlightsNear && depFlightsNear.length > 0) {
                depFlightsNear.forEach(flight => {
                    addAFlight(flight, adults, children, infants, true, isRoundTrip);
                });
                depFound = true;
            }
        }
        
        if (!retFound && isRoundTrip) {
            let retFlightsNear = await searchFlights(strDestName, strOriginName, returnDate, totalPassengers, false);
            
            if (retFlightsNear && retFlightsNear.length > 0) {
                retFlightsNear.forEach(flight => {
                    addAFlight(flight, adults, children, infants, false, isRoundTrip);
                });
                retFound = true;
            }
        }
        
        if (!depFound || (isRoundTrip && !retFound)) {
            alert("No flights found for the selected dates");
        }
        
    } catch (err) {
        console.error('Error searching flights:', err);
        alert('Error searching for flights. Please try again.');
    }
}

function addAFlight(flight, adults, children, infants, isDepFlight, isRoundTrip) {
    revealFlightLabels();

    const htmlFlight = createFlightObj(
        flight.flightId,
        flight.origin,
        flight.destination,
        flight.departureDate,
        flight.arrivalDate,
        flight.departureTime,
        flight.arrivalTime,
        flight.price,
        flight.availableSeats,
        adults,
        children,
        infants,
        isDepFlight,
        isRoundTrip
    );

    if (isDepFlight) {
        document.querySelector("#flights-output").appendChild(htmlFlight);
    } else {
        document.querySelector("#return-flights-output").appendChild(htmlFlight);
    }
    return true
}

async function searchFlights(origin, destination, date, passengers, exactDate) {
    try {
        const url = `/api/flights/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${date}&passengers=${passengers}&exact=${exactDate}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to search flights');
        }
        
        const data = await response.json();
        return data.flights;
        
    } catch (err) {
        console.error('Error fetching flights:', err);
        return [];
    }
}

function createFlightObj(id, origin, dest, depdate, arrdate, deptime, arrtime, price, seats, adults, children, infants, isDepFlight, isRoundTrip) {
    const trFlight = document.createElement('tr')
    trFlight.appendChild(createTextCell(id))
    trFlight.appendChild(createTextCell(origin))
    trFlight.appendChild(createTextCell(dest))
    trFlight.appendChild(createTextCell(depdate))
    trFlight.appendChild(createTextCell(arrdate))
    trFlight.appendChild(createTextCell(deptime))
    trFlight.appendChild(createTextCell(arrtime))
    trFlight.appendChild(createTextCell(price))
    trFlight.appendChild(createTextCell(seats))
    
    let buttonText = "Add to cart";
    if (isRoundTrip) {
        buttonText = isDepFlight ? "Select Departure" : "Select Return";
    }
    
    const cartCell = createButtonCell(buttonText)
    cartCell.addEventListener("click", () => {
        if (seats < adults+children+infants) {
            alert("You require too many seats. Reduce guests or pick a different flight.")
        }
        else {
            if (isRoundTrip) {
                addFlightToRoundTrip(id, adults, children, infants, isDepFlight)
            } else {
                addFlightToCart(id, adults, children, infants)
            }
        }
    })
    trFlight.appendChild(cartCell)
    return trFlight
}

function createTextCell(text) {
    const divText = document.createElement('td')
    divText.textContent = text
    return divText
}

function createButtonCell(text) {
    const tdText = document.createElement('td')
    const buttonText = document.createElement('button')
    buttonText.textContent = text
    tdText.appendChild(buttonText)
    return tdText
}

function revealFlightLabels() {
    document.querySelector("#departure-flights-label").classList.remove("hidden")
    document.querySelector("#flights-table").classList.remove("hidden")
}

function revealReturnFlightLabels() {
    document.querySelector("#return-flights-label").classList.remove("hidden")
    document.querySelector("#return-flights-table").classList.remove("hidden")
}

function addFlightToCart(id, adults, children, infants) {    
    const cartItem = {
        type: 'flight',
        tripType: 'oneway',
        flightId: id,
        adults: adults,
        children: children,
        infants: infants,
    };
    
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart.push(cartItem);
    sessionStorage.setItem('cart', JSON.stringify(cart));

    alert('Flight added to cart!');
}

function addFlightToRoundTrip(id, adults, children, infants, isDepFlight) {
    // Store in session storage temporarily
    if (isDepFlight) {
        sessionStorage.setItem('roundTripDeparture', JSON.stringify({
            flightId: id,
            adults: adults,
            children: children,
            infants: infants
        }));
        alert('Departure flight selected! Now select a return flight.');
    } else {
        // Check if departure is selected
        const departure = sessionStorage.getItem('roundTripDeparture');
        if (!departure) {
            alert('Please select a departure flight first!');
            return;
        }
        
        const depData = JSON.parse(departure);
        
        // Add round trip to cart
        const cartItem = {
            type: 'flight',
            tripType: 'roundtrip',
            departureFlight: depData.flightId,
            returnFlight: id,
            adults: adults,
            children: children,
            infants: infants,
        };
        
        let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        cart.push(cartItem);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        
        // Clear temporary storage
        sessionStorage.removeItem('roundTripDeparture');
        
        alert('Round trip flights added to cart!');
    }
}