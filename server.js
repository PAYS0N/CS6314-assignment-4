const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const initializeDatabase = require('./db-init');

const app = express();
const PORT = 3000;

const mysql = require('mysql2/promise');

// Create database connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'CS6314assignment4user',
    password: 'Assignment4DBpassword',
    database: 'Assignment4DB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes
app.get('/api/flights/departing', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT f.*
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            WHERE f.origin LIKE '%Austin%'
            AND f.departureDate BETWEEN '2024-09-01' AND '2024-10-31';
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            flights: rows
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/hotels/texas', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT hb.hotelBookingId, hb.*, h.*
            FROM hotel_bookings hb
            JOIN hotels h ON hb.hotelId = h.hotelId
            WHERE h.city IN ('Austin', 'Dallas', 'Houston', 'San Antonio')
            AND hb.checkInDate BETWEEN '2024-09-01' AND '2024-10-31';
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such hotels' });
        }
        
        res.json({
            success: true,
            hotels: rows
        });
    } catch (err) {
        console.error('Error fetching hotels:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/hotels/expensive', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT hb.hotelBookingId, hb.*, h.*
            FROM hotel_bookings hb
            JOIN hotels h ON hb.hotelId = h.hotelId
            WHERE hb.totalPrice = (
            SELECT MAX(totalPrice) FROM hotel_bookings);
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such hotels' });
        }
        
        res.json({
            success: true,
            hotels: rows
        });
    } catch (err) {
        console.error('Error fetching hotels:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/flights/expensive', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT fb.flightBookingId, fb.*, f.*
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            WHERE fb.totalPrice = (
                SELECT MAX(totalPrice) FROM flight_bookings
            );`
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            flights: rows
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/flights/infant', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT fb.flightBookingId, f.*
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            JOIN tickets t ON fb.flightBookingId = t.flightBookingId
            JOIN passengers p ON t.ssn = p.ssn
            WHERE p.category = 'infant';
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            flights: rows
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/flights/noinfant', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT f.*
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            WHERE f.origin LIKE '%Austin%'
            AND fb.flightBookingId NOT IN (
                SELECT fb2.flightBookingId
                FROM flight_bookings fb2
                JOIN tickets t2 ON fb2.flightBookingId = t2.flightBookingId
                JOIN passengers p2 ON t2.ssn = p2.ssn
                WHERE p2.category = 'infant'
            );
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            flights: rows
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/flights/children', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT fb.flightBookingId, f.*
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            JOIN tickets t ON fb.flightBookingId = t.flightBookingId
            JOIN passengers p ON t.ssn = p.ssn
            GROUP BY fb.flightBookingId
            HAVING SUM(CASE WHEN p.category = 'infant' THEN 1 ELSE 0 END) >= 1
            AND SUM(CASE WHEN p.category = 'child' THEN 1 ELSE 0 END) >= 5;
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            flights: rows
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/flights/arriving', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT COUNT(*) AS bookedFlightsCount
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            WHERE f.destination LIKE '%Sacramento%'
            AND f.arrivalDate BETWEEN '2024-09-01' AND '2024-10-31';
            `
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No such flights' });
        }
        
        res.json({
            success: true,
            bookedFlightsCount: rows[0].bookedFlightsCount
        });
    } catch (err) {
        console.error('Error fetching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/bookings/:flightBookingId/passengers', async (req, res) => {
    const { flightBookingId } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT DISTINCT p.*
            FROM passengers p
            JOIN tickets t ON p.ssn = t.ssn
            WHERE t.flightBookingId = ?
            `,
            [flightBookingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No passengers found for this booking' });
        }

        res.json({
            success: true,
            passengers: rows
        });
    } catch (err) {
        console.error('Error fetching passengers:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/bookings/flight/:flightBookingId', async (req, res) => {
    const { flightBookingId } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT * FROM flight_bookings WHERE flightBookingId = ?;
            `,
            [flightBookingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nothing found for this booking' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/bookings/hotel/:hotelBookingId', async (req, res) => {
    const { hotelBookingId } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT * FROM hotel_bookings WHERE hotelBookingId = ?;
            `,
            [hotelBookingId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nothing found for this booking' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching booking:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/bookings/sep2024', async (req, res) => {
    try {
        const [flights] = await pool.query(
            `
            SELECT DISTINCT f.flightId
            FROM flight_bookings fb
            JOIN flights f ON fb.flightId = f.flightId
            WHERE f.departureDate BETWEEN '2024-09-01' AND '2024-09-30';
            `
        );

        const [hotels] = await pool.query(
            `
            SELECT DISTINCT h.hotelId
            FROM hotel_bookings hb
            JOIN hotels h ON hb.hotelId = h.hotelId
            WHERE (hb.checkInDate BETWEEN '2024-09-01' AND '2024-09-30')
               OR (hb.checkOutDate BETWEEN '2024-09-01' AND '2024-09-30')
               OR (hb.checkInDate <= '2024-09-01' AND hb.checkOutDate >= '2024-09-30');
            `
        );

        res.json({
            success: true,
            flights: flights.map(f => f.flightId),
            hotels: hotels.map(h => h.hotelId)
        });

    } catch (err) {
        console.error('Error fetching bookings for Sep 2024:', err);
        res.status(500).json({ error: 'Database error' });
    }
});


app.get('/api/flights/:flightId/:userSSN', async (req, res) => {
    const { flightId, userSSN } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT f.*
            FROM flights f
            JOIN flight_bookings fb ON f.flightId = fb.flightId
            JOIN tickets t ON fb.flightBookingId = t.flightBookingId
            WHERE f.flightId = ? AND t.ssn = ?;
            `,
            [flightId, userSSN]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Flight not found for this user' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching flight:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/hotels/:hotelId/:userSSN', async (req, res) => {
    const { hotelId, userSSN } = req.params;

    try {
        const [rows] = await pool.query(
            `
            SELECT h.*
            FROM hotels h
            JOIN hotel_bookings hb ON h.hotelId = hb.hotelId
            JOIN guesses g ON hb.hotelBookingId = g.hotelBookingId
            WHERE h.hotelId = ? AND g.ssn = ?;
            `,
            [hotelId, userSSN]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found for this user' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching hotel:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/contact', (req, res) => {
    const { firstName, lastName, phone, gender, email, dob, comment } = req.body;
    const xmlFile = './data/contacts.xml';
    
    let existingContacts = { contacts: { contact: [] } };
    
    // Read existing XML file
if (fs.existsSync(xmlFile)) {
    const xmlData = fs.readFileSync(xmlFile, 'utf8');
    xml2js.parseString(xmlData, (err, result) => {
        if (!err && result && result.contacts) {
            if (result.contacts.contact && Array.isArray(result.contacts.contact)) {
                existingContacts.contacts.contact = result.contacts.contact;
                
            }
        }
    });
}
    
    // Create new contact with auto-incremented ID
    const nextId = 'CONTACT-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    const newContact = {
        contactId: nextId,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        email: email,
        gender: gender || 'Not Given',
        comment: comment
    };
    
    // Ensure contact array exists before pushing
    if (!existingContacts.contacts.contact) {
        existingContacts.contacts.contact = [];
    }
    
    existingContacts.contacts.contact.push(newContact);
    
    // Build XML and save
    const builder = new xml2js.Builder({
        rootName: 'contacts',
        xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    try {
        const xml = builder.buildObject(existingContacts.contacts);
        fs.writeFileSync(xmlFile, xml);
        
        res.json({ 
            success: true,
            contactId: nextId
        });
    } catch (err) {
        console.error('Error writing XML:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save contact' 
        });
    }
});

app.get('/api/flights/search', async (req, res) => {
    const { origin, destination, date, passengers, exact } = req.query;
    
    if (!origin || !destination || !date || !passengers) {
        return res.status(400).json({ 
            error: 'Missing required parameters: origin, destination, date, passengers' 
        });
    }
    
    const isExact = exact === 'true';
    const passengerCount = parseInt(passengers);
    
    try {
        let query;
        let params;
        
        if (isExact) {
            // Search for exact date match
            query = `
                SELECT * FROM flights 
                WHERE origin = ? 
                AND destination = ? 
                AND departureDate = ? 
                AND availableSeats >= ?
                ORDER BY departureTime
            `;
            params = [origin, destination, date, passengerCount];
        } else {
            // Search within 3 days before and after
            query = `
                SELECT * FROM flights 
                WHERE origin = ? 
                AND destination = ? 
                AND departureDate BETWEEN DATE_SUB(?, INTERVAL 3 DAY) AND DATE_ADD(?, INTERVAL 3 DAY)
                AND departureDate != ?
                AND availableSeats >= ?
                ORDER BY departureDate, departureTime
            `;
            params = [origin, destination, date, date, date, passengerCount];
        }
        
        const [rows] = await pool.query(query, params);
        
        res.json({ 
            flights: rows,
            count: rows.length,
            searchParams: {
                origin,
                destination,
                date,
                passengers: passengerCount,
                exactDate: isExact
            }
        });
        
    } catch (err) {
        console.error('Error searching flights:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get specific flight by ID
app.get('/api/flights/:flightId', async (req, res) => {
    const { flightId } = req.params;
    
    try {
        const [rows] = await pool.query(
            'SELECT * FROM flights WHERE flightId = ?',
            [flightId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Flight not found' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching flight:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/hotels', (req, res) => {
    const xml = fs.readFileSync('./data/hotels.xml', 'utf8');
    xml2js.parseString(xml, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});

app.get('/api/cars', (req, res) => {
    const xml = fs.readFileSync('./data/cars.xml', 'utf8');
    xml2js.parseString(xml, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json(result);
    });
});

// POST endpoint to create a new car booking
app.post('/api/carbookings', (req, res) => {
    const bookings = req.body.bookings; 
    if (!bookings || !Array.isArray(bookings)) {
        return res.status(400).json({ success: false, error: 'Invalid bookings data' });
    }
    const xmlFile = './data/carbookings.xml';
    const carsFile = './data/cars.xml';
    const builder = new xml2js.Builder();
    // Read existing bookings 
    let existingBookings = { bookings: { booking: [] } };
    if (fs.existsSync(xmlFile)) {
        const xmlData = fs.readFileSync(xmlFile, 'utf8');
        xml2js.parseString(xmlData, (err, result) => {
            if (!err && result.bookings) existingBookings = result;
        });
    }

    // Read cars XML
    const carsData = fs.readFileSync(carsFile, 'utf8');
    xml2js.parseString(carsData, (err, carsResult) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        bookings.forEach(booking => {
            // Add unique booking number
            booking.bookingNumber = Date.now() + Math.floor(Math.random() * 1000);
            // Add booking to carbookings.xml
            existingBookings.bookings.booking.push({
                userId: booking.userId,
                bookingNumber: booking.bookingNumber,
                carId: booking.carId,
                city: booking.city,
                carType: booking.carType,
                checkin: booking.checkin,
                checkout: booking.checkout,
                pricePerDay: booking.pricePerDay,
                totalPrice: booking.totalPrice
            });
            // Update car's bookedPeriods in cars.xml
            const car = carsResult.cars.car.find(c => c.carId[0] === booking.carId);
            if (car) {
                if (!car.bookedPeriods) car.bookedPeriods = [{}];
                if (!car.bookedPeriods[0].period) car.bookedPeriods[0].period = [];
                car.bookedPeriods[0].period.push({
                    checkin: booking.checkin,
                    checkout: booking.checkout
                });
            }
        });
        // Save updated carbookings.xml
        const updatedBookingsXml = builder.buildObject(existingBookings);
        fs.writeFileSync(xmlFile, updatedBookingsXml);
        // Save updated cars.xml
        const updatedCarsXml = builder.buildObject(carsResult);
        fs.writeFileSync(carsFile, updatedCarsXml);
        res.json({ success: true, bookingNumbers: bookings.map(b => b.bookingNumber) });
    });
});


app.post('/api/bookings', (req, res) => {
    const bookings = req.body.bookings;
    if (!bookings || !Array.isArray(bookings)) {
        return res.status(400).json({ success: false, error: 'Invalid bookings data' });
    }
    //Save bookings to bookings.json
    const bookingsFile = './data/bookings.json';
    let existingBookings = [];
    if (fs.existsSync(bookingsFile)) {
        existingBookings = JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
    }
    const updatedBookings = existingBookings.concat(bookings);
    fs.writeFileSync(bookingsFile, JSON.stringify(updatedBookings, null, 2));
    //Update available rooms in hotels.xml
    const xmlFile = './data/hotels.xml';
    const xmlData = fs.readFileSync(xmlFile, 'utf8');

    xml2js.parseString(xmlData, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        bookings.forEach(booking => {
            const hotel = result.hotels.hotel.find(h => h.hotelId[0] === booking.hotelId);
            if (hotel) {
                hotel.availableRooms[0] = (parseInt(hotel.availableRooms[0]) - booking.rooms).toString();
            }
        });
        const builder = new xml2js.Builder();
        const updatedXml = builder.buildObject(result);
        fs.writeFileSync(xmlFile, updatedXml);
    });
    res.json({ success: true });
});

app.post('/api/flight-bookings/complete', async (req, res) => {
    const { bookings } = req.body;
    
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid booking data' 
        });
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const completedBookings = [];
        
        for (const booking of bookings) {
            const { flightId, passengers, totalPrice, totalSeats } = booking;
            
            // Get flight details
            const [flightRows] = await connection.query(
                'SELECT * FROM flights WHERE flightId = ?',
                [flightId]
            );
            
            if (flightRows.length === 0) {
                throw new Error(`Flight ${flightId} not found`);
            }
            
            const flight = flightRows[0];
            
            // Check if enough seats available
            if (flight.availableSeats < totalSeats) {
                throw new Error(`Not enough seats available on flight ${flightId}`);
            }
            
            // Insert or update passengers
            for (const passenger of passengers) {
                // Check if passenger exists
                const [existingPassenger] = await connection.query(
                    'SELECT ssn FROM passengers WHERE ssn = ?',
                    [passenger.ssn]
                );
                
                if (existingPassenger.length === 0) {
                    // Insert new passenger
                    await connection.query(
                        'INSERT INTO passengers (ssn, firstName, lastName, dateOfBirth, category) VALUES (?, ?, ?, ?, ?)',
                        [passenger.ssn, passenger.firstName, passenger.lastName, passenger.dateOfBirth, passenger.category]
                    );
                } else {
                    // Update existing passenger (in case details changed)
                    await connection.query(
                        'UPDATE passengers SET firstName = ?, lastName = ?, dateOfBirth = ?, category = ? WHERE ssn = ?',
                        [passenger.firstName, passenger.lastName, passenger.dateOfBirth, passenger.category, passenger.ssn]
                    );
                }
            }
            
            // Insert flight booking
            const [bookingResult] = await connection.query(
                'INSERT INTO flight_bookings (flightId, totalPrice) VALUES (?, ?)',
                [flightId, totalPrice]
            );
            
            const flightBookingId = bookingResult.insertId;
            
            // Insert tickets for each passenger
            const ticketDetails = [];
            for (const passenger of passengers) {
                const [ticketResult] = await connection.query(
                    'INSERT INTO tickets (flightBookingId, ssn, price) VALUES (?, ?, ?)',
                    [flightBookingId, passenger.ssn, passenger.price]
                );
                
                ticketDetails.push({
                    ticketId: ticketResult.insertId,
                    flightBookingId: flightBookingId,
                    ssn: passenger.ssn,
                    firstName: passenger.firstName,
                    lastName: passenger.lastName,
                    dateOfBirth: passenger.dateOfBirth,
                    category: passenger.category,
                    price: passenger.price
                });
            }
            
            // Update available seats
            await connection.query(
                'UPDATE flights SET availableSeats = availableSeats - ? WHERE flightId = ?',
                [totalSeats, flightId]
            );
            
            // Add completed booking info
            completedBookings.push({
                flightBookingId: flightBookingId,
                flightId: flightId,
                origin: flight.origin,
                destination: flight.destination,
                departureDate: flight.departureDate,
                arrivalDate: flight.arrivalDate,
                departureTime: flight.departureTime,
                arrivalTime: flight.arrivalTime,
                totalPrice: totalPrice,
                tickets: ticketDetails
            });
        }
        
        await connection.commit();
        
        res.json({ 
            success: true,
            bookings: completedBookings
        });
        
    } catch (err) {
        await connection.rollback();
        console.error('Error completing flight booking:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message || 'Failed to complete booking' 
        });
    } finally {
        connection.release();
    }
});

app.get('/api/carbookings/:userId', (req, res) => {
    const userId = req.params.userId;
    const xmlFile = './data/carbookings.xml';
    
    if (!fs.existsSync(xmlFile)) {
        return res.json({ bookings: { booking: [] } });
    }
    
    const xmlData = fs.readFileSync(xmlFile, 'utf8');
    xml2js.parseString(xmlData, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        
        if (result.bookings && result.bookings.booking) {
            const userBookings = result.bookings.booking.filter(
                b => b.userId && b.userId[0] === userId
            );
            res.json({ bookings: { booking: userBookings } });
        } else {
            res.json({ bookings: { booking: [] } });
        }
    });
});

// Check if phone number exists
app.get('/api/check-phone/:phone', async (req, res) => {
    const phone = req.params.phone;
    
    try {
        const [rows] = await pool.query(
            'SELECT phone FROM users WHERE phone = ?',
            [phone]
        );
        
        res.json({ exists: rows.length > 0 });
    } catch (err) {
        console.error('Error checking phone:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Register new user
app.post('/api/registration', async (req, res) => {
    const { phone, password, firstName, lastName, dob, gender, email } = req.body;
    
    try {
        // Double-check phone doesn't exist (belt and suspenders)
        const [existing] = await pool.query(
            'SELECT phone FROM users WHERE phone = ?',
            [phone]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number already exists' 
            });
        }
        
        // Insert new user
        await pool.query(
            'INSERT INTO users (phone, password, firstName, lastName, dob, gender, email) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [phone, password, firstName, lastName, dob, gender || null, email]
        );
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Database error' 
        });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;
    
    try {
        const [rows] = await pool.query(
            'SELECT phone, password, firstName, lastName, email, gender, dob FROM users WHERE phone = ?',
            [phone]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid phone number or password' 
            });
        }
        
        const user = rows[0];
        
        // Check password, plain text is fine
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid phone number or password' 
            });
        }
        
        // Return user info
        res.json({ 
            success: true,
            user: {
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                gender: user.gender,
                dob: user.dob,
            }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Database error' 
        });
    }
});

app.post('/api/admin/load-flights', async (req, res) => {
    const adminPhone = req.body.adminPhone;
    
    // Verify admin
    if (adminPhone !== '222-222-2222') {
        return res.status(403).json({ 
            success: false, 
            error: 'Unauthorized. Admin access required.' 
        });
    }
    
    try {
        // Read flights from JSON file
        const flightsFile = './data/flights.json';
        
        if (!fs.existsSync(flightsFile)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Flights JSON file not found' 
            });
        }
        
        const flightsData = JSON.parse(fs.readFileSync(flightsFile, 'utf8'));
        
        if (!Array.isArray(flightsData) || flightsData.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid flights data' 
            });
        }
        
        // Clear existing flights (optional - remove if you want to keep existing data)
        await pool.query('DELETE FROM flights');
        
        // Insert each flight into database
        let successCount = 0;
        let errorCount = 0;
        
        for (const flight of flightsData) {
            try {
                await pool.query(
                    'INSERT INTO flights (flightId, origin, destination, departureDate, arrivalDate, departureTime, arrivalTime, availableSeats, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        flight.flightId,
                        flight.origin,
                        flight.destination,
                        flight.departureDate,
                        flight.arrivalDate,
                        flight.departureTime,
                        flight.arrivalTime,
                        flight.availableSeats,
                        flight.price
                    ]
                );
                successCount++;
            } catch (err) {
                console.error(`Error inserting flight ${flight.flightId}:`, err);
                errorCount++;
            }
        }
        
        res.json({ 
            success: true,
            message: `Successfully loaded ${successCount} flights into database`,
            successCount: successCount,
            errorCount: errorCount
        });
        
    } catch (err) {
        console.error('Error loading flights:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load flights into database' 
        });
    }
});

async function startServer() {
    try {
        // Initialize database
        console.log('Initializing database...');
        await initializeDatabase();
        
        // Test database connection
        const connection = await pool.getConnection();
        console.log('Database connection pool established');
        connection.release();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
        
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

app.post('/api/admin/load-hotels', async (req, res) => {
    const adminPhone = req.body.adminPhone;
    
    // Verify admin
    if (adminPhone !== '222-222-2222') {
        return res.status(403).json({ 
            success: false, 
            error: 'Unauthorized. Admin access required.' 
        });
    }
    
    try {
        // Read hotels from XML file
        const hotelsFile = './data/hotels.xml';
        
        if (!fs.existsSync(hotelsFile)) {
            return res.status(404).json({ 
                success: false, 
                error: 'Hotels XML file not found' 
            });
        }
        
        const xmlData = fs.readFileSync(hotelsFile, 'utf8');
        
        xml2js.parseString(xmlData, async (err, result) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    error: 'Failed to parse XML file' 
                });
            }
            
            if (!result.hotels || !result.hotels.hotel) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid hotels XML structure' 
                });
            }
            
            const hotels = result.hotels.hotel;
            
            try {
                // Clear existing hotels (optional)
                await pool.query('DELETE FROM hotels');
                
                let successCount = 0;
                let errorCount = 0;
                
                for (const hotel of hotels) {
                    try {
                        await pool.query(
                            'INSERT INTO hotels (hotelId, hotelName, city, pricePerNight) VALUES (?, ?, ?, ?)',
                            [
                                hotel.hotelId[0],
                                hotel.name[0],
                                hotel.city[0],
                                parseFloat(hotel.pricePerNight[0])
                            ]
                        );
                        successCount++;
                    } catch (err) {
                        console.error(`Error inserting hotel ${hotel.hotelId[0]}:`, err);
                        errorCount++;
                    }
                }
                
                res.json({ 
                    success: true,
                    message: `Successfully loaded ${successCount} hotels into database`,
                    successCount: successCount,
                    errorCount: errorCount
                });
                
            } catch (err) {
                console.error('Error loading hotels:', err);
                res.status(500).json({ 
                    success: false, 
                    error: 'Failed to load hotels into database' 
                });
            }
        });
        
    } catch (err) {
        console.error('Error loading hotels:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load hotels into database' 
        });
    }
});

// Get hotels from database by city
app.get('/api/hotels/search', async (req, res) => {
    const { city } = req.query;
    
    if (!city) {
        return res.status(400).json({ 
            error: 'Missing required parameter: city' 
        });
    }
    
    try {
        const [rows] = await pool.query(
            'SELECT * FROM hotels WHERE city = ?',
            [city]
        );
        
        res.json({ 
            hotels: rows,
            count: rows.length
        });
        
    } catch (err) {
        console.error('Error searching hotels:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get specific hotel by ID
app.get('/api/hotels/:hotelId', async (req, res) => {
    const { hotelId } = req.params;
    
    try {
        const [rows] = await pool.query(
            'SELECT * FROM hotels WHERE hotelId = ?',
            [hotelId]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Hotel not found' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching hotel:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Complete hotel booking with guest information
app.post('/api/hotel-bookings/complete', async (req, res) => {
    const { bookings } = req.body;
    
    if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid booking data' 
        });
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const completedBookings = [];
        
        for (const booking of bookings) {
            const { hotelId, checkInDate, checkOutDate, numberOfRooms, guests, totalPrice } = booking;
            
            // Get hotel details
            const [hotelRows] = await connection.query(
                'SELECT * FROM hotels WHERE hotelId = ?',
                [hotelId]
            );
            
            if (hotelRows.length === 0) {
                throw new Error(`Hotel ${hotelId} not found`);
            }
            
            const hotel = hotelRows[0];
            
            // Insert hotel booking
            const [bookingResult] = await connection.query(
                'INSERT INTO hotel_bookings (hotelId, checkInDate, checkOutDate, numberOfRooms, pricePerNight, totalPrice) VALUES (?, ?, ?, ?, ?, ?)',
                [hotelId, checkInDate, checkOutDate, numberOfRooms, hotel.pricePerNight, totalPrice]
            );
            
            const hotelBookingId = bookingResult.insertId;
            
            // Insert guests
            const guestDetails = [];
            for (const guest of guests) {
                // Check if guest with same SSN already exists in guesses table for this booking
                const [existingGuest] = await connection.query(
                    'SELECT ssn FROM guesses WHERE ssn = ? AND hotelBookingId = ?',
                    [guest.ssn, hotelBookingId]
                );
                
                if (existingGuest.length === 0) {
                    await connection.query(
                        'INSERT INTO guesses (ssn, hotelBookingId, firstName, lastName, dateOfBirth, category) VALUES (?, ?, ?, ?, ?, ?)',
                        [guest.ssn, hotelBookingId, guest.firstName, guest.lastName, guest.dateOfBirth, guest.category]
                    );
                }
                
                guestDetails.push({
                    ssn: guest.ssn,
                    hotelBookingId: hotelBookingId,
                    firstName: guest.firstName,
                    lastName: guest.lastName,
                    dateOfBirth: guest.dateOfBirth,
                    category: guest.category
                });
            }
            
            // Add completed booking info
            completedBookings.push({
                hotelBookingId: hotelBookingId,
                hotelId: hotelId,
                hotelName: hotel.hotelName,
                city: hotel.city,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                numberOfRooms: numberOfRooms,
                pricePerNight: hotel.pricePerNight,
                totalPrice: totalPrice,
                guests: guestDetails
            });
        }
        
        await connection.commit();
        
        res.json({ 
            success: true,
            bookings: completedBookings
        });
        
    } catch (err) {
        await connection.rollback();
        console.error('Error completing hotel booking:', err);
        res.status(500).json({ 
            success: false, 
            error: err.message || 'Failed to complete booking' 
        });
    } finally {
        connection.release();
    }
});

startServer();