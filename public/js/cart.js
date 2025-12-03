window.onload = async function onwindowload() {
    document.querySelector("#booking-button").addEventListener("click", completeBooking)
    document.querySelector("#flight-button").addEventListener("click", completeFlightBooking)

    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    // Sets up the tables for booking
    for (const item of cart) {
        if (item.type === "hotel") {
            revealHotelLabels();
            const htmlHotel = createHotelObj(
                item.hotelId,
                item.hotelName,
                item.city,
                item.checkin,
                item.checkout,
                item.pricePerNight,
                item.rooms,
                item.adults,
                item.children,
                item.infants
            );
            document.querySelector("#hotels-tbody").appendChild(htmlHotel);
        } else if (item.type === "car") {
            revealCarLabels();
            const htmlCar = createCarObj(
                item.carId,
                item.city,
                item.carType,
                item.checkin,
                item.checkout,
                item.pricePerDay
            );
            document.querySelector("#cars-tbody").appendChild(htmlCar);
        }
        if (item.type === "flight") {
            revealFlightLabels();
            const flightDetails = await getFlightDetails(item.flightId);
            const htmlFlight = createFlightObj(
                item.flightId,
                flightDetails.origin,
                flightDetails.destination,
                flightDetails.departureDate,
                flightDetails.arrivalDate,
                flightDetails.departureTime,
                flightDetails.arrivalTime,
                flightDetails.price,
                item.adults,
                item.children,
                item.infants,
            );
            document.querySelector("#flights-output").appendChild(htmlFlight);
        }
    }
};

// Hotel table properties
function createHotelObj(id, name, city, checkin, checkout, pricePerNight, rooms, adults, children, infants) {
    const tr = document.createElement("tr");
    tr.appendChild(createTextCell(id));
    tr.appendChild(createTextCell(name));
    tr.appendChild(createTextCell(city));
    tr.appendChild(createTextCell(checkin));
    tr.appendChild(createTextCell(checkout));
    tr.appendChild(createTextCell(adults));
    tr.appendChild(createTextCell(children));
    tr.appendChild(createTextCell(infants));
    tr.appendChild(createTextCell(rooms));
    tr.appendChild(createTextCell(pricePerNight));

    const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    tr.appendChild(createTextCell(pricePerNight * rooms * days));

    return tr;
}

// Car table properties
function createCarObj(id, city, carType, checkin, checkout, pricePerDay) {
    const tr = document.createElement("tr");
    tr.appendChild(createTextCell(id));
    tr.appendChild(createTextCell(city));
    tr.appendChild(createTextCell(carType));
    tr.appendChild(createTextCell(checkin));
    tr.appendChild(createTextCell(checkout));
    tr.appendChild(createTextCell(pricePerDay));

    const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    tr.appendChild(createTextCell(pricePerDay * days));

    return tr;
}

function createTextCell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

function revealHotelLabels() {
    document.querySelector("#hotels-table").classList.remove("hidden")
    document.querySelector("#hotels-label").classList.remove("hidden")
}

function revealCarLabels() {
    document.querySelector("#cars-label").classList.remove("hidden")
    document.querySelector("#cars-table").classList.remove("hidden");
}

// Grabs items from the cart, sends them to the json and xml for hotels and cars, and displays the booking numbers
async function completeBooking() {
    const userId = sessionStorage.getItem("userId") || (() => {
        const id = "user-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("userId", id);
        return id;
    })();

    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    remainingCart = cart.filter(item => item.type === 'flight');
    cart = cart.filter(item => item.type != 'flight');

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const hotelBookings = [];
    const carbookings = [];
    const allBookingNumbers = []; // <-- collect all numbers here

    cart.forEach(item => {
        const bookingNumber = Date.now() + Math.floor(Math.random() * 1000);
        allBookingNumbers.push(bookingNumber); // <-- push here

        if (item.type === "hotel") {
            const days = (new Date(item.checkout) - new Date(item.checkin)) / (1000 * 60 * 60 * 24);
            const totalPrice = item.pricePerNight * item.rooms * days;
            hotelBookings.push({
                userId,
                bookingNumber,
                type: "hotel",
                hotelId: item.hotelId,
                hotelName: item.hotelName,
                city: item.city,
                checkin: item.checkin,
                checkout: item.checkout,
                adults: item.adults,
                children: item.children,
                infants: item.infants,
                rooms: item.rooms,
                pricePerNight: item.pricePerNight,
                totalPrice
            });
        } else if (item.type === "car") {
            const days = (new Date(item.checkout) - new Date(item.checkin)) / (1000 * 60 * 60 * 24);
            const totalPrice = item.pricePerDay * days;
            carbookings.push({
                userId,
                bookingNumber,
                type: "car",
                carId: item.carId,
                city: item.city,
                carType: item.carType,
                checkin: item.checkin,
                checkout: item.checkout,
                pricePerDay: item.pricePerDay,
                totalPrice
            });
        }
    });

    try {
        if (hotelBookings.length) {
            await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookings: hotelBookings })
            });
        }

        if (carbookings.length) {
            await fetch("/api/carbookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookings: carbookings })
            });
        }

        // Alert with all booking numbers
        sessionStorage.setItem('cart', JSON.stringify(remainingCart));
        alert("Booking successful! Your booking numbers: " + allBookingNumbers.join(", "));
        window.location.reload()
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
}

async function getFlightDetails(id) {
    try {
        const response = await fetch('/api/flights')
        const flights = await response.json()
        return flights.find(flight => flight.flightId == id)

        
    } catch (err) {
        console.error('Error fetching flights:', err)
    }
}

function createFlightObj(id, origin, dest, depdate, arrdate, deptime, arrtime, price, adults, children, infants) {
    const trFlight = document.createElement('tr')
    trFlight.appendChild(createTextCell(id))
    trFlight.appendChild(createTextCell(origin))
    trFlight.appendChild(createTextCell(dest))
    trFlight.appendChild(createTextCell(depdate))
    trFlight.appendChild(createTextCell(arrdate))
    trFlight.appendChild(createTextCell(deptime))
    trFlight.appendChild(createTextCell(arrtime))
    trFlight.appendChild(createTextCell(Math.round(10 *(price*adults + price*children*.7 + price*infants*.1))/10))
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
    document.querySelector("#flights-label").classList.remove("hidden")
    document.querySelector("#flight-button").classList.remove("hidden")
    document.querySelector("#flights-table").classList.remove("hidden")
}

async function completeFlightBooking() {
    let userId = sessionStorage.getItem('userId');
    if (!userId) {
        userId = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('userId', userId);
    }

    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let flightCart = cart.filter(item => item.type === 'flight');
    let remainingCart = cart.filter(item => item.type !== 'flight');

    if (flightCart.length === 0) {
        alert("No flights in cart!");
        return;
    }

    const allPassengers = [];
    
    for (const flight of flightCart) {
        const totalPassengers = flight.adults + flight.children + flight.infants;
        const flightDetails = await getFlightDetails(flight.flightId);
        
        alert(`Please enter information for ${totalPassengers} passenger(s) for flight ${flight.flightId} (${flightDetails.origin} to ${flightDetails.destination})`);
        
        const passengers = [];
        
        // Collect info for adults
        for (let i = 0; i < flight.adults; i++) {
            const passenger = collectPassengerInfo(`Adult ${i + 1}`);
            if (!passenger) return;
            passenger.type = 'adult';
            passengers.push(passenger);
        }
        
        // Collect info for children
        for (let i = 0; i < flight.children; i++) {
            const passenger = collectPassengerInfo(`Child ${i + 1}`);
            if (!passenger) return;
            passenger.type = 'child';
            passengers.push(passenger);
        }
        
        // Collect info for infants
        for (let i = 0; i < flight.infants; i++) {
            const passenger = collectPassengerInfo(`Infant ${i + 1}`);
            if (!passenger) return;
            passenger.type = 'infant';
            passengers.push(passenger);
        }
        
        allPassengers.push({
            flightId: flight.flightId,
            passengers: passengers
        });
    }

    // Create bookings
    const bookings = flightCart.map((item, index) => {
        const bookingNumber = 'FL-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
        const flightDetails = getFlightDetails(item.flightId);
        
        return flightDetails.then(details => {
            const totalPrice = details.price * item.adults + 
                             details.price * item.children * 0.7 + 
                             details.price * item.infants * 0.1;
            
            return {
                userId,
                bookingNumber,
                flightId: item.flightId,
                origin: details.origin,
                destination: details.destination,
                departureDate: details.departureDate,
                arrivalDate: details.arrivalDate,
                departureTime: details.departureTime,
                arrivalTime: details.arrivalTime,
                adults: item.adults,
                children: item.children,
                infants: item.infants,
                totalSeats: item.adults + item.children + item.infants,
                totalPrice: totalPrice,
                passengers: allPassengers[index].passengers
            };
        });
    });

    try {
        const resolvedBookings = await Promise.all(bookings);
        
        const response = await fetch('/api/flight-bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookings: resolvedBookings })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Server error:', text);
            alert('Booking failed. Please try again.');
            return;
        }

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('cart', JSON.stringify(remainingCart));
            
            // Display booking confirmation
            let confirmationMsg = 'Flight booking successful!\n\n';
            confirmationMsg += `User ID: ${userId}\n`;
            resolvedBookings.forEach(booking => {
                confirmationMsg += `Booking Number: ${booking.bookingNumber}\n`;
                confirmationMsg += `Flight ID: ${booking.flightId}\n`;
                confirmationMsg += `Flight: ${booking.origin} to ${booking.destination}\n`;
                confirmationMsg += `Departure: ${booking.departureDate} at ${booking.departureTime}\n`;
                confirmationMsg += `Arrival: ${booking.arrivalDate} at ${booking.arrivalTime}\n`;
                confirmationMsg += `Total Price: $${booking.totalPrice.toFixed(2)}\n`;
                confirmationMsg += `Passengers:\n`;
                booking.passengers.forEach(p => {
                    confirmationMsg += `  - ${p.firstName} ${p.lastName} (${p.type})\n`;
                    confirmationMsg += `  - ${p.ssn}\n`;
                    confirmationMsg += `  - ${p.dateOfBirth}\n`;
                });
                confirmationMsg += '\n';
            });
            
            alert(confirmationMsg);
            window.location.reload();
        } else {
            alert('Booking failed: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server.');
    }
}

function collectPassengerInfo(passengerLabel) {
    const firstName = prompt(`Enter first name for ${passengerLabel}:`);
    if (!firstName) return null;
    
    const lastName = prompt(`Enter last name for ${passengerLabel}:`);
    if (!lastName) return null;
    
    const dob = prompt(`Enter date of birth for ${passengerLabel} (YYYY-MM-DD):`);
    if (!dob) return null;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dob)) {
        alert('Invalid date format. Please use YYYY-MM-DD');
        return null;
    }
    
    const ssn = prompt(`Enter SSN for ${passengerLabel} (XXX-XX-XXXX):`);
    if (!ssn) return null;
    
    // Validate SSN format
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    if (!ssnRegex.test(ssn)) {
        alert('Invalid SSN format. Please use XXX-XX-XXXX');
        return null;
    }
    
    return {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dob,
        ssn: ssn
    };
}
