const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'CS6314assignment4user',
    password: 'Assignment4DBpassword',
};

const dbName = 'Assignment4DB';

async function initializeDatabase() {
    let connection;
    
    try {
        // Connect without specifying database
        connection = await mysql.createConnection(dbConfig);
        
        console.log('Connected to MariaDB server');
        
        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Database '${dbName}' created or already exists`);
        
        // Use the database
        await connection.query(`USE ${dbName}`);
        
        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                phone VARCHAR(12) PRIMARY KEY,
                password VARCHAR(255) NOT NULL,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                gender VARCHAR(20),
                email VARCHAR(100) NOT NULL
            )
        `);
        console.log('Table "users" created or already exists');
        
        // Create flights table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS flights (
                flightId VARCHAR(20) PRIMARY KEY,
                origin VARCHAR(50) NOT NULL,
                destination VARCHAR(50) NOT NULL,
                departureDate DATE NOT NULL,
                arrivalDate DATE NOT NULL,
                departureTime TIME NOT NULL,
                arrivalTime TIME NOT NULL,
                availableSeats INT(11) NOT NULL,
                price DECIMAL(10,2) NOT NULL
            )
        `);
        console.log('Table "flights" created or already exists');
        
        // Create passengers table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS passengers (
                ssn VARCHAR(11) PRIMARY KEY,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                dateOfBirth VARCHAR(10) NOT NULL,
                category ENUM('adult','child','infant') NOT NULL
            )
        `);
        console.log('Table "passengers" created or already exists');
        
        // Create flight_bookings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS flight_bookings (
                flightBookingId INT(11) AUTO_INCREMENT PRIMARY KEY,
                flightId VARCHAR(20) NOT NULL,
                totalPrice DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (flightId) REFERENCES flights(flightId)
            )
        `);
        console.log('Table "flight_bookings" created or already exists');
        
        // Create tickets table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                ticketId INT(11) AUTO_INCREMENT PRIMARY KEY,
                flightBookingId INT(11) NOT NULL,
                ssn VARCHAR(11) NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (flightBookingId) REFERENCES flight_bookings(flightBookingId),
                FOREIGN KEY (ssn) REFERENCES passengers(ssn)
            )
        `);
        console.log('Table "tickets" created or already exists');
        
        // Create contacts table (for XML file tracking)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                contactId INT AUTO_INCREMENT PRIMARY KEY,
                phone VARCHAR(12) NOT NULL,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                dob VARCHAR(10) NOT NULL,
                email VARCHAR(100) NOT NULL,
                gender VARCHAR(20),
                comment TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table "contacts" created or already exists');
        
        // Create hotels table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS hotels (
                hotelId VARCHAR(20) PRIMARY KEY,
                hotelName VARCHAR(100) NOT NULL,
                city VARCHAR(50) NOT NULL,
                pricePerNight DECIMAL(10,2) NOT NULL
            )
        `);
        console.log('Table "hotels" created or already exists');
        
        // Create hotel_bookings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS hotel_bookings (
                hotelBookingId INT(11) AUTO_INCREMENT PRIMARY KEY,
                hotelId VARCHAR(20) NOT NULL,
                checkInDate DATE NOT NULL,
                checkOutDate DATE NOT NULL,
                numberOfRooms INT NOT NULL,
                pricePerNight DECIMAL(10,2) NOT NULL,
                totalPrice DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (hotelId) REFERENCES hotels(hotelId)
            )
        `);
        console.log('Table "hotel_bookings" created or already exists');
        
        // Create guesses table (guests)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS guesses (
                ssn VARCHAR(11) NOT NULL,
                hotelBookingId INT(11) NOT NULL,
                firstName VARCHAR(50) NOT NULL,
                lastName VARCHAR(50) NOT NULL,
                dateOfBirth VARCHAR(10) NOT NULL,
                category ENUM('adult','child','infant') NOT NULL,
                PRIMARY KEY (ssn, hotelBookingId),
                FOREIGN KEY (hotelBookingId) REFERENCES hotel_bookings(hotelBookingId)
            )
        `);
        console.log('Table "guesses" created or already exists');        
        console.log('Database initialization completed successfully!');
        
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

module.exports = initializeDatabase;