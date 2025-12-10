window.onload = async function onwindowload() {
    document.querySelector("#booking-button").addEventListener("click", completeHotelBooking)
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
        }
        if (item.type === "flight") {
            revealFlightLabels();
            
            if (item.tripType === 'roundtrip') {
                // Display both departure and return flights
                const depFlightDetails = await getFlightDetails(item.departureFlight);
                const retFlightDetails = await getFlightDetails(item.returnFlight);
                
                const htmlDepFlight = createFlightObj(
                    item.departureFlight,
                    depFlightDetails.origin,
                    depFlightDetails.destination,
                    depFlightDetails.departureDate,
                    depFlightDetails.arrivalDate,
                    depFlightDetails.departureTime,
                    depFlightDetails.arrivalTime,
                    depFlightDetails.price,
                    item.adults,
                    item.children,
                    item.infants,
                    "Departure"
                );
                document.querySelector("#flights-output").appendChild(htmlDepFlight);
                
                const htmlRetFlight = createFlightObj(
                    item.returnFlight,
                    retFlightDetails.origin,
                    retFlightDetails.destination,
                    retFlightDetails.departureDate,
                    retFlightDetails.arrivalDate,
                    retFlightDetails.departureTime,
                    retFlightDetails.arrivalTime,
                    retFlightDetails.price,
                    item.adults,
                    item.children,
                    item.infants,
                    "Return"
                );
                document.querySelector("#flights-output").appendChild(htmlRetFlight);
            } else {
                // One-way flight
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
                    "One-way"
                );
                document.querySelector("#flights-output").appendChild(htmlFlight);
            }
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

function createTextCell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
}

function revealHotelLabels() {
    document.querySelector("#hotels-table").classList.remove("hidden")
    document.querySelector("#hotels-label").classList.remove("hidden")
    document.querySelector("#booking-button").classList.remove("hidden")
}

// Complete hotel booking with guest information to database
async function completeHotelBooking() {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let hotelCart = cart.filter(item => item.type === 'hotel');
    let remainingCart = cart.filter(item => item.type !== 'hotel');

    if (hotelCart.length === 0) {
        alert("No hotels in cart!");
        return;
    }

    const allBookingData = [];
    
    // Collect guest info for each hotel
    for (const hotel of hotelCart) {
        const totalGuests = parseInt(hotel.adults) + parseInt(hotel.children) + parseInt(hotel.infants);
        
        alert(`Please enter information for ${totalGuests} guest(s) for ${hotel.hotelName}`);
        
        const guests = [];
        
        // Collect info for adults
        for (let i = 0; i < hotel.adults; i++) {
            const guest = collectGuestInfo(`Adult ${i + 1}`);
            if (!guest) return;
            guest.category = 'adult';
            guests.push(guest);
        }
        
        // Collect info for children
        for (let i = 0; i < hotel.children; i++) {
            const guest = collectGuestInfo(`Child ${i + 1}`);
            if (!guest) return;
            guest.category = 'child';
            guests.push(guest);
        }
        
        // Collect info for infants
        for (let i = 0; i < hotel.infants; i++) {
            const guest = collectGuestInfo(`Infant ${i + 1}`);
            if (!guest) return;
            guest.category = 'infant';
            guests.push(guest);
        }
        
        // Calculate total price
        const days = (new Date(hotel.checkout) - new Date(hotel.checkin)) / (1000 * 60 * 60 * 24);
        const totalPrice = hotel.pricePerNight * hotel.rooms * days;
        
        allBookingData.push({
            hotelId: hotel.hotelId,
            checkInDate: hotel.checkin,
            checkOutDate: hotel.checkout,
            numberOfRooms: hotel.rooms,
            guests: guests,
            totalPrice: totalPrice
        });
    }

    // Send booking data to server
    try {
        const response = await fetch('/api/hotel-bookings/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookings: allBookingData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Booking failed: ' + (errorData.error || 'Unknown error'));
            return;
        }

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('cart', JSON.stringify(remainingCart));
            
            // Display booking confirmation
            displayHotelBookingConfirmation(result.bookings);
            
            alert('Hotel booking successful! Check the page for booking details.');
        } else {
            alert('Booking failed: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server.');
    }
}

function collectGuestInfo(guestLabel) {
    const firstName = prompt(`Enter first name for ${guestLabel}:`);
    if (!firstName) return null;
    
    const lastName = prompt(`Enter last name for ${guestLabel}:`);
    if (!lastName) return null;
    
    const dob = prompt(`Enter date of birth for ${guestLabel} (MM-DD-YYYY):`);
    if (!dob) return null;
    
    // Validate date format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(dob)) {
        alert('Invalid date format. Please use MM-DD-YYYY');
        return null;
    }
    
    const ssn = prompt(`Enter SSN for ${guestLabel} (XXX-XX-XXXX):`);
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

function displayHotelBookingConfirmation(bookings) {
    const mainDiv = document.querySelector("#main");
    
    // Clear existing confirmation
    const existingConfirmation = document.querySelector("#hotel-booking-confirmation");
    if (existingConfirmation) {
        existingConfirmation.remove();
    }
    
    const confirmationDiv = document.createElement("div");
    confirmationDiv.id = "hotel-booking-confirmation";
    confirmationDiv.style.marginTop = "2rem";
    
    let html = '<h2>Hotel Booking Confirmation</h2>';
    
    bookings.forEach(booking => {
        html += `
            <div class="booking-details" style="border: 2px solid black; padding: 1rem; margin: 1rem 0;">
                <h3>Hotel Booking ID: ${booking.hotelBookingId}</h3>
                <div class="hotel-info">
                    <p><strong>Hotel ID:</strong> ${booking.hotelId}</p>
                    <p><strong>Hotel Name:</strong> ${booking.hotelName}</p>
                    <p><strong>City:</strong> ${booking.city}</p>
                    <p><strong>Check-in:</strong> ${booking.checkInDate}</p>
                    <p><strong>Check-out:</strong> ${booking.checkOutDate}</p>
                    <p><strong>Number of Rooms:</strong> ${booking.numberOfRooms}</p>
                    <p><strong>Price per Night:</strong> $${booking.pricePerNight}</p>
                    <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
                </div>
                
                <h4>Guest Information:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #ddd;">
                            <th style="border: 1px solid black; padding: 0.5rem;">SSN</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">Name</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">DOB</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">Category</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        booking.guests.forEach(guest => {
            html += `
                <tr>
                    <td style="border: 1px solid black; padding: 0.5rem;">${guest.ssn}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${guest.firstName} ${guest.lastName}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${guest.dateOfBirth}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${guest.category}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    confirmationDiv.innerHTML = html;
    mainDiv.appendChild(confirmationDiv);
}

async function getFlightDetails(id) {
    try {
        const response = await fetch(`/api/flights/${id}`);
        
        if (!response.ok) {
            throw new Error('Flight not found');
        }
        
        return await response.json();
        
    } catch (err) {
        console.error('Error fetching flight details:', err);
        return null;
    }
}

function createFlightObj(id, origin, dest, depdate, arrdate, deptime, arrtime, price, adults, children, infants, tripLabel) {
    const trFlight = document.createElement('tr')
    trFlight.appendChild(createTextCell(tripLabel))
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

function revealFlightLabels() {
    document.querySelector("#flights-label").classList.remove("hidden")
    document.querySelector("#flight-button").classList.remove("hidden")
    document.querySelector("#flights-table").classList.remove("hidden")
}

async function completeFlightBooking() {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let flightCart = cart.filter(item => item.type === 'flight');
    let remainingCart = cart.filter(item => item.type !== 'flight');

    if (flightCart.length === 0) {
        alert("No flights in cart!");
        return;
    }

    const allBookingData = [];
    
    // Collect passenger info for each flight booking
    for (const flightItem of flightCart) {
        const totalPassengers = flightItem.adults + flightItem.children + flightItem.infants;
        
        if (flightItem.tripType === 'roundtrip') {
            // Round trip - book both flights
            const depFlightDetails = await getFlightDetails(flightItem.departureFlight);
            const retFlightDetails = await getFlightDetails(flightItem.returnFlight);
            
            if (!depFlightDetails || !retFlightDetails) {
                alert('Could not find flight details');
                return;
            }
            
            alert(`Please enter information for ${totalPassengers} passenger(s) for round trip (${depFlightDetails.origin} ⇄ ${depFlightDetails.destination})`);
            
            const passengers = await collectAllPassengerInfo(totalPassengers, flightItem.adults, flightItem.children, flightItem.infants, depFlightDetails.price);
            if (!passengers) return;
            
            // Calculate total price for both flights
            const depTotalPrice = passengers.reduce((sum, p) => +sum + +p.price, 0);
            const retTotalPrice = passengers.map(p => ({
                ...p,
                price: p.category === 'adult' ? retFlightDetails.price : 
                       p.category === 'child' ? retFlightDetails.price * 0.7 : 
                       retFlightDetails.price * 0.1
            })).reduce((sum, p) => +sum + +p.price, 0);
            
            // Add departure flight booking
            allBookingData.push({
                flightId: flightItem.departureFlight,
                passengers: passengers,
                totalPrice: depTotalPrice,
                totalSeats: totalPassengers
            });
            
            // Add return flight booking with same passengers but different prices
            allBookingData.push({
                flightId: flightItem.returnFlight,
                passengers: passengers.map(p => ({
                    ...p,
                    price: p.category === 'adult' ? retFlightDetails.price : 
                           p.category === 'child' ? retFlightDetails.price * 0.7 : 
                           retFlightDetails.price * 0.1
                })),
                totalPrice: retTotalPrice,
                totalSeats: totalPassengers
            });
            
        } else {
            // One-way flight
            const flightDetails = await getFlightDetails(flightItem.flightId);
            
            if (!flightDetails) {
                alert(`Could not find flight details for flight ${flightItem.flightId}`);
                return;
            }
            
            alert(`Please enter information for ${totalPassengers} passenger(s) for flight ${flightItem.flightId} (${flightDetails.origin} to ${flightDetails.destination})`);
            
            const passengers = await collectAllPassengerInfo(totalPassengers, flightItem.adults, flightItem.children, flightItem.infants, flightDetails.price);
            if (!passengers) return;
            
            const totalPrice = passengers.reduce((sum, p) => +sum + +p.price, 0);
            
            allBookingData.push({
                flightId: flightItem.flightId,
                passengers: passengers,
                totalPrice: totalPrice,
                totalSeats: totalPassengers
            });
        }
    }

    // Send booking data to server
    try {
        const response = await fetch('/api/flight-bookings/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookings: allBookingData })
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert('Booking failed: ' + (errorData.error || 'Unknown error'));
            return;
        }

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem('cart', JSON.stringify(remainingCart));
            
            // Display booking confirmation
            displayFlightBookingConfirmation(result.bookings);
            
            alert('Flight booking successful! Check the page for booking details.');
        } else {
            alert('Booking failed: ' + result.error);
        }
    } catch (err) {
        console.error(err);
        alert('Error connecting to server.');
    }
}

async function collectAllPassengerInfo(total, adults, children, infants, basePrice) {
    const passengers = [];
    
    // Collect info for adults
    for (let i = 0; i < adults; i++) {
        const passenger = collectPassengerInfo(`Adult ${i + 1}`);
        if (!passenger) return null;
        passenger.category = 'adult';
        passenger.price = basePrice;
        passengers.push(passenger);
    }
    
    // Collect info for children
    for (let i = 0; i < children; i++) {
        const passenger = collectPassengerInfo(`Child ${i + 1}`);
        if (!passenger) return null;
        passenger.category = 'child';
        passenger.price = basePrice * 0.7;
        passengers.push(passenger);
    }
    
    // Collect info for infants
    for (let i = 0; i < infants; i++) {
        const passenger = collectPassengerInfo(`Infant ${i + 1}`);
        if (!passenger) return null;
        passenger.category = 'infant';
        passenger.price = basePrice * 0.1;
        passengers.push(passenger);
    }
    
    return passengers;
}

function collectPassengerInfo(passengerLabel) {
    const firstName = prompt(`Enter first name for ${passengerLabel}:`);
    if (!firstName) return null;
    
    const lastName = prompt(`Enter last name for ${passengerLabel}:`);
    if (!lastName) return null;
    
    const dob = prompt(`Enter date of birth for ${passengerLabel} (MM-DD-YYYY):`);
    if (!dob) return null;
    
    // Validate date format
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(dob)) {
        alert('Invalid date format. Please use MM-DD-YYYY');
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

function displayFlightBookingConfirmation(bookings) {
    const mainDiv = document.querySelector("#main");
    
    // Clear existing confirmation
    const existingConfirmation = document.querySelector("#flight-booking-confirmation");
    if (existingConfirmation) {
        existingConfirmation.remove();
    }
    
    const confirmationDiv = document.createElement("div");
    confirmationDiv.id = "flight-booking-confirmation";
    confirmationDiv.style.marginTop = "2rem";
    
    let html = '<h2>Flight Booking Confirmation</h2>';
    
    bookings.forEach(booking => {
        html += `
            <div class="booking-details" style="border: 2px solid black; padding: 1rem; margin: 1rem 0;">
                <h3>Flight Booking ID: ${booking.flightBookingId}</h3>
                <div class="flight-info">
                    <p><strong>Flight ID:</strong> ${booking.flightId}</p>
                    <p><strong>Route:</strong> ${booking.origin} → ${booking.destination}</p>
                    <p><strong>Departure:</strong> ${booking.departureDate} at ${booking.departureTime}</p>
                    <p><strong>Arrival:</strong> ${booking.arrivalDate} at ${booking.arrivalTime}</p>
                    <p><strong>Total Price:</strong> $${booking.totalPrice.toFixed(2)}</p>
                </div>
                
                <h4>Passenger Tickets:</h4>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #ddd;">
                            <th style="border: 1px solid black; padding: 0.5rem;">Ticket ID</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">SSN</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">Name</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">DOB</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">Category</th>
                            <th style="border: 1px solid black; padding: 0.5rem;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        booking.tickets.forEach(ticket => {
            html += `
                <tr>
                    <td style="border: 1px solid black; padding: 0.5rem;">${ticket.ticketId}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${ticket.ssn}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${ticket.firstName} ${ticket.lastName}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${ticket.dateOfBirth}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">${ticket.category}</td>
                    <td style="border: 1px solid black; padding: 0.5rem;">$${ticket.price}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
    });
    
    confirmationDiv.innerHTML = html;
    mainDiv.appendChild(confirmationDiv);
}