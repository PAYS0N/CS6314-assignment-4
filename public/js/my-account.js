window.addEventListener("load", () => {
    checkLoginStatus();
    checkAdminStatus();
});

function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    
    if (loggedIn !== 'true') {
        alert('Please login to access your account.');
        window.location.href = './login.html';
    }
}

function checkAdminStatus() {
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin === 'true') {
        document.getElementById('admin-section').style.display = 'block';
    }
}

async function loadFlightsToDatabase() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/admin/load-flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminPhone: adminPhone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message + `\nSuccess: ${data.successCount}, Errors: ${data.errorCount}`);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadHotelsToDatabase() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/admin/load-hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminPhone: adminPhone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message + `\nSuccess: ${data.successCount}, Errors: ${data.errorCount}`);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        alert('An error occurred while loading hotels.');
    }
}

async function loadFlightsFromTexas() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/departing');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadHotelsInTexas() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/hotels/texas');
        
        const data = await response.json();
        
        if (data.success) {
            for (const hotel of data.hotels) { 
                alert(`Hotel ID: ${hotel.hotelId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading hotels in Texas:', error);
        alert('An error occurred while loading hotels in Texas.');
    }
}

async function loadExpensiveHotels() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/hotels/expensive');
        
        const data = await response.json();
        
        if (data.success) {
            for (const hotel of data.hotels) { 
                alert(`Hotel ID: ${hotel.hotelId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading expensive hotels:', error);
        alert('An error occurred while loading expensive hotels.');
    }
}

async function loadFlightsWithInfant() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/infant');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadFlightsWithChildren() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/children');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadExpensiveFlights() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/expensive');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadFlightsWithNoInfant() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/noinfant');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadFlightsToCalifornia() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/arriving');
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.bookedFlightsCount)
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadMyFlights() {
    const ssn = document.getElementById('ssn-input').value;
        
    try {
        const response = await fetch(`/api/flights/bookings/${ssn}`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No flight found.');
            return;
        }
        document.querySelector('#ssn-output').innerHTML = ""
        for (const pair of data) {
            document.querySelector('#ssn-output').innerHTML += `Flight ID: ${pair.flightId}, Booking ID: ${pair.flightBookingId}<br>`;
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadMyHotels() {
    const ssn = document.getElementById('ssn-input').value;
        
    try {
        const response = await fetch(`/api/hotels/bookings/${ssn}`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No hotel found.');
            return;
        }
        document.querySelector('#ssn-output').innerHTML = ""
        for (const pair of data) {
            document.querySelector('#ssn-output').innerHTML += `Hotel ID: ${pair.hotelId}, Booking ID: ${pair.hotelBookingId}<br>`;
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        alert('An error occurred while loading hotels.');
    }
}

async function loadPassengers() {
    const flightInput = document.getElementById('passenger-flight-id').value;
    const flightId = parseInt(flightInput, 10);
        
    try {
        const response = await fetch(`/api/bookings/${flightId}/passengers`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No flight booking found.');
            return;
        }

        for (const passenger of data.passengers) { 
            alert(`Passenger ${passenger.ssn}: ${passenger.firstName} ${passenger.lastName}, Category: ${passenger.category}`);
        }

    } catch (error) {
        console.error('Error loading passengers', error);
        alert('An error occurred while loading passengers.');
    }
}

async function loadBookedFlight() {
    const flightInput = document.getElementById('booked-flight-id-input').value;
    const flightId = parseInt(flightInput, 10);
        
    try {
        const response = await fetch(`/api/bookings/flight/${flightId}`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No flight booking found.');
            return;
        }

        alert(`Booking ID: ${data.flightBookingId}, Flight ID: ${data.flightId}, Total Price: $${data.totalPrice}`);

    } catch (error) {
        console.error('Error loading passengers', error);
        alert('An error occurred while loading passengers.');
    }
}

async function loadSeptember() {
    try {
        const response = await fetch(`/api/bookings/sep2024`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No flight booking found.');
            return;
        }

        for (const flight of data.flights) { 
            document.querySelector('#booking-output').innerHTML += "Flight ID: " + flight + "<br>";
        }
        for (const hotel of data.hotels) { 
            document.querySelector('#booking-output').innerHTML += "Hotel ID: " + hotel + "<br>";
        }


    } catch (error) {
        console.error('Error loading passengers', error);
        alert('An error occurred while loading passengers.');
    }
}

async function loadBookedHotel() {
    const hotelInput = document.getElementById('booked-hotel-id-input').value;
    const hotelId = parseInt(hotelInput, 10);
        
    try {
        const response = await fetch(`/api/bookings/hotel/${hotelId}`);   
        
        const data = await response.json();
        
        if (response.status === 404) {
            alert('No hotel booking found.');
            return;
        }

        alert(`Hotel ${data.hotelId}: ${data.checkInDate.split('T')[0]} to ${data.checkOutDate.split('T')[0]}, Total Price: $${data.totalPrice}`);
    } catch (error) {
        console.error('Error loading passengers', error);
        alert('An error occurred while loading passengers.');
    }
}
