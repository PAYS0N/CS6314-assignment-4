window.addEventListener("load", () => {
    document.querySelector("#stays-form").addEventListener("submit", (e) => {
        submitStaysForm(e)
    });
});

function isValidCity(city) {
    city = city.trim()
    const parts = city.split(",")
    if (parts.length !== 2) return false
    const state = parts[1].trim()
    if (state === "TX" || state === "CA") {
        return true
    }
    return false
}

function isValidDate(dateStr) {
    const givenDate = new Date(dateStr)
    const startDate = new Date("2024-09-01")
    const endDate = new Date("2024-12-01")
    return givenDate >= startDate && givenDate <= endDate
}

function calculateRooms(a, c) {
    return Math.ceil((+a + +c) / 2)
}

function submitStaysForm(e) {
    e.preventDefault()

    const formData = new FormData(document.querySelector("#stays-form"));
    const city = formData.get("city")
    const checkin = formData.get("checkin-date")
    const checkout = formData.get("checkout-date")
    const adults = formData.get("adults")
    const children = formData.get("children")
    const infants = formData.get("infants")

    if (!isValidCity(city)) {
        alert("City must be a city in TX or CA.")
    }
    else if (!isValidDate(checkin)) {
        alert("Must check in from Sep 1, 2024 to Dec 1, 2024.")
    }
    else if (!isValidDate(checkout)) {
        alert("Must check in from Sep 1, 2024 to Dec 1, 2024.")
    }
    else if (checkout <= checkin) {
        alert("Check-out must be after check-in.")
    }
    else {
        const staysOutput = document.querySelector("#stays-output")
        const rooms = calculateRooms(adults, children)
        staysOutput.textContent = 
            "City: " + city +
            "\nCheck-in: " + checkin +
            "\nCheck-out: " + checkout +
            "\nAdults: " + adults + ", Children: " + children + ", Infants: " + infants +
            "\nRooms needed: " + rooms;
        displayAvailableHotels(city, checkin, checkout, rooms, adults, children, infants)
    }
}

async function displayAvailableHotels(city, checkin, checkout, rooms, adults, children, infants) {
    document.querySelector("#hotels-output").innerHTML = ""

    const strCityName = city.trim().split(",")[0]
    const xmlHotels = await getHotels()

    xmlHotels.hotels.hotel.forEach(hotel => {
        //logic to check if hotel is available
        if (hotel.city[0] === strCityName && hotel.availableRooms[0] > 0) {
            revealHotelLabels()
            const htmlHotel = createHotelObj(hotel.hotelId[0], hotel.name[0], strCityName, checkin, checkout, hotel.pricePerNight[0], hotel.availableRooms[0], rooms, adults, children, infants)
            document.querySelector("#hotels-output").appendChild(htmlHotel)
        }
        else {
            // console.log(hotel.city[0])
        }
    });

}

async function getHotels() {
    try {
        const response = await fetch('/api/hotels')

        const xmlHotels = await response.json()
        return xmlHotels
    } catch (err) {
        console.error('Error fetching hotels:', err)
    }
}

function createHotelObj(id, name, city, checkin, checkout, price, availableRooms, roomsNeeded, adults, children, infants) {
    const trHotel = document.createElement('tr')
    trHotel.appendChild(createTextCell(id))
    trHotel.appendChild(createTextCell(name))
    trHotel.appendChild(createTextCell(city))
    trHotel.appendChild(createTextCell(checkin))
    trHotel.appendChild(createTextCell(checkout))
    trHotel.appendChild(createTextCell(price))
    trHotel.appendChild(createTextCell(availableRooms))
    const cartCell = createButtonCell("Add to cart")
    cartCell.addEventListener("click", () => {
        if (availableRooms < roomsNeeded) {
            alert("You require too many rooms. Reduce guests or pick a different hotel.")
        }
        else {
            addHotelToCart(id, name, city, checkin, checkout, price, roomsNeeded, adults, children, infants)
        }
    })
    trHotel.appendChild(cartCell)
    return trHotel
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

function revealHotelLabels() {
    document.querySelector("#hotels-table").classList.remove("hidden")
}

function addHotelToCart(id, name, city, checkin, checkout, price, rooms, adults, children, infants) {    
    const cartItem = {
        type: 'hotel',
        hotelId: id,
        hotelName: name,
        city: city,
        checkin: checkin,
        checkout: checkout,
        rooms: rooms,
        adults: adults,
        children: children,
        infants: infants,
        pricePerNight: price,
    };
    
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart.push(cartItem);
    sessionStorage.setItem('cart', JSON.stringify(cart));

    alert('Hotel added to cart!');
}