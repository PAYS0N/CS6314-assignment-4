const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

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
app.post('/api/contact', (req, res) => {
    // Save contact data to JSON
    const contacts = JSON.parse(fs.readFileSync('./data/contacts.json', 'utf8') || '[]');
    contacts.push(req.body);
    fs.writeFileSync('./data/contacts.json', JSON.stringify(contacts, null, 2));
    res.json({ success: true });
});

app.get('/api/flights', (req, res) => {
    const flights = JSON.parse(fs.readFileSync('./data/flights.json', 'utf8'));
    res.json(flights);
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

app.post('/api/flight-bookings', (req, res) => {
    const bookings = req.body.bookings;

    if (!bookings || !Array.isArray(bookings)) {
        return res.status(400).json({ success: false, error: 'Invalid bookings data' });
    }

    // Save flight bookings to flight-bookings.json
    const flightBookingsFile = './data/flight-bookings.json';
    let existingFlightBookings = [];
    if (fs.existsSync(flightBookingsFile)) {
        existingFlightBookings = JSON.parse(fs.readFileSync(flightBookingsFile, 'utf8'));
    }
    const updatedFlightBookings = existingFlightBookings.concat(bookings);
    fs.writeFileSync(flightBookingsFile, JSON.stringify(updatedFlightBookings, null, 2));

    // Update available seats in flights.json
    const flightsFile = './data/flights.json';
    const flightsData = JSON.parse(fs.readFileSync(flightsFile, 'utf8'));

    bookings.forEach(booking => {
        const flight = flightsData.find(f => f.flightId === booking.flightId);
        if (flight) {
            flight.availableSeats -= booking.totalSeats;
            if (flight.availableSeats < 0) {
                flight.availableSeats = 0;
            }
        }
    });

    fs.writeFileSync(flightsFile, JSON.stringify(flightsData, null, 2));

    res.json({ success: true });
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
            'SELECT phone, password, firstName, lastName, email, gender FROM users WHERE phone = ?',
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
                gender: user.gender
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

app.post('/api/logout', (req, res) => {
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});