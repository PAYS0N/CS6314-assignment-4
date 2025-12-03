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
    else if (new Date(departure) > new Date(returnDate)) {
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
    let [origin, destination, departure, returnDate] = flightDetails
    let [adults, children, infants] = passengerDetails

    document.querySelector("#flights-output").innerHTML = ""

    const strOriginName = origin.trim().split(",")[0]
    const strDestName = destination.trim().split(",")[0]
    const jsonFlights = await getFlights()

    let depFound = false
    let retFound = false
    jsonFlights.forEach(flight => {
        // check if flight is available
        if (
            flight.origin === strOriginName &&
            flight.destination === strDestName &&
            flight.departureDate === departure &&
            flight.availableSeats >= adults + children + infants
        ) {
            depFound = addAFlight(flight, adults, children, infants, flight.origin === strOriginName)
        }
        if (
            flight.origin === strDestName &&
            flight.destination === strOriginName &&
            flight.departureDate === returnDate &&
            flight.availableSeats >= adults + children + infants
        ) {
            retFound = addAFlight(flight, adults, children, infants, flight.origin === strOriginName)
        }
    });
    if (!depFound || !retFound) {
        jsonFlights.forEach(flight => {
            // check if flight is available
            const flightDate = new Date(flight.departureDate);
            const depDate = new Date(departure);
            const retDate = (returnDate != "") ? new Date(returnDate) : null;

            if (
                flight.origin === strOriginName &&
                flight.destination === strDestName &&
                Math.abs(flightDate - depDate) < 3 * 24 * 60 * 60 * 1000 && 
                flight.departureDate != departure &&
                flight.availableSeats >= adults + children + infants
            ) {
                depFound = addAFlight(flight, adults, children, infants, flight.origin === strOriginName)
            }
            if (
                flight.origin === strDestName &&
                flight.destination === strOriginName &&
                retDate && Math.abs(flightDate - retDate) < 3 * 24 * 60 * 60 * 1000 &&
                flight.departureDate != returnDate &&
                flight.availableSeats >= adults + children + infants
            ) {
                retFound = addAFlight(flight, adults, children, infants, flight.origin === strOriginName)
            }
        });
    }
    if(!depFound && !retFound) {
        alert("No flights found")
    }

}

function addAFlight(flight, adults, children, infants, isDepFlight) {
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
        isDepFlight
    );

    document.querySelector("#flights-output").appendChild(htmlFlight);
    return true
}

async function getFlights() {
    try {
        const response = await fetch('/api/flights')

        return await response.json()
    } catch (err) {
        console.error('Error fetching flights:', err)
    }
}

function createFlightObj(id, origin, dest, depdate, arrdate, deptime, arrtime, price, seats, adults, children, infants, isDepFlight) {
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
    const cartCell = createButtonCell("Add " + (isDepFlight ? "Departure" : "Return") + " to cart")
    cartCell.addEventListener("click", () => {
        if (seats < adults+children+infants) {
            alert("You require too many seats. Reduce guests or pick a different flight.")
        }
        else {
            addFlightToCart(id, adults, children, infants)
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
    document.querySelector("#flights-table").classList.remove("hidden")
}

function addFlightToCart(id, adults, children, infants) {    
    const cartItem = {
        type: 'flight',
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
