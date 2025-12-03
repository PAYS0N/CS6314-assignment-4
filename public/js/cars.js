window.addEventListener("load", async () => {
    developDom()
    await autofillFromLastBooking();
    setupContactListeners()
});

// DOM implementation of cars page
function developDom() {
    const main = document.querySelector("#main")
    const form = document.createElement("form")
    form.textContent = "Cars"
    form.id = "cars-form"
    main.appendChild(form)
    form.appendChild(makeStandardFormGroup("text", "city", "City: "))
    form.appendChild(makecarDropdown())
    form.appendChild(makeStandardFormGroup("date", "checkin-date", "Check-in: "))
    form.appendChild(makeStandardFormGroup("date", "checkout-date", "Check-out: "))
    const button = document.createElement("button")
    button.type = "submit"
    button.id = "cars-button"
    button.textContent = "Submit"
    form.appendChild(button)
    const divOut = document.createElement("div")
    divOut.classList.add("form-output")
    divOut.id = "cars-output"
    main.appendChild(divOut)
    const table = document.createElement("table");
    table.id = "cars-table";
    table.classList.add("hidden");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr>
        <th>ID</th>
        <th>City</th>
        <th>Car Type</th>
        <th>Check-in</th>
        <th>Check-out</th>
        <th>Price per Day</th>
        <th>Total Price</th>
        <th>Add to Cart</th>
    </tr>`;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    tbody.id = "cars-tbody";
    table.appendChild(tbody);
    main.appendChild(table);
    
}

function makeStandardFormGroup(type, name, labeltext) {
    const group = document.createElement("div")
    group.classList.add("form-group")
    const label = document.createElement("label")
    label.for = name
    label.textContent = labeltext
    group.appendChild(label)
    const input = document.createElement("input")
    input.type = type
    input.id = name
    input.name = name
    input.required = true
    group.appendChild(input)
    return group
}

// Car Options
function makecarDropdown() {
    const group = document.createElement("div")
    group.classList.add("form-group")
    const label = document.createElement("label")
    label.for = "car-type"
    label.textContent = "Select Car Type:"
    group.appendChild(label)
    const select = document.createElement("select")
    select.id = "car-type"
    select.name = "car-type"
    const option1 = document.createElement("option")
    option1.value = "Economy"
    option1.textContent = "Economy"
    const option2 = document.createElement("option")
    option2.value = "SUV"
    option2.textContent = "SUV"
    const option3 = document.createElement("option")
    option3.value = "Compact"
    option3.textContent = "Compact"
    const option4 = document.createElement("option")
    option4.value = "Midsize"
    option4.textContent = "Midsize"
    select.appendChild(option1)
    select.appendChild(option2)
    select.appendChild(option3)
    select.appendChild(option4)
    group.appendChild(select)
    return group
}

// Listener events for DOM
function setupContactListeners() {
    document.querySelector('#cars-form').addEventListener("submit", (e) => {
        submitContactForm(e)
    })
}

// Same logic as hotels
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

// Same logic as hotels
function isValidDate(dateStr) {
    const givenDate = new Date(dateStr)
    const startDate = new Date("2024-09-01")
    const endDate = new Date("2024-12-01")
    return givenDate >= startDate && givenDate <= endDate
}

// Print inputs on screen before car options are given
function displayContactResults(c, t, chi, cho) {
    const outputDiv = document.querySelector("#cars-output")
    outputDiv.textContent = "City: " + c + "\nType: " + t + "\nCheck in: " + chi + "\nCheck Out: " + cho
}

// Displays inputted info and avaliable cars
function submitContactForm(e) {
    e.preventDefault()
    const formData = new FormData(document.querySelector("#cars-form"));
    const city = formData.get("city")
    const carType = formData.get("car-type")
    const checkin = formData.get("checkin-date")
    const checkout = formData.get("checkout-date")

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
        displayContactResults(city, carType, checkin, checkout)
        displayAvailableCars(city, carType, checkin, checkout)
    }
}

// Checks XML for cars fitting the input criteria
async function displayAvailableCars(city, carType, checkin, checkout) {
    const tbody = document.querySelector("#cars-tbody");
    tbody.innerHTML = "";

    const strCityName = city.trim().split(",")[0];
    const userCheckin = new Date(checkin);
    const userCheckout = new Date(checkout);

    const xmlCars = await getCars();

    let found = false;
    xmlCars.cars.car.forEach(car => {
        const carCity = car.city[0].toLowerCase();
        const carStart = new Date(car.availability[0].start[0]);
        const carEnd = new Date(car.availability[0].end[0]);

        // Only show cars in the correct city AND within availability range
        if (
            carCity === strCityName.toLowerCase() &&
            userCheckin >= carStart &&
            userCheckout <= carEnd
        ) {
            const htmlCar = createCarObj(
                car.carId[0],
                strCityName,
                carType,
                checkin,
                checkout,
                parseFloat(car.pricePerDay[0])
            );
            tbody.appendChild(htmlCar);
            found = true;
        }
    });

    if (found) {
        revealCarLabels();
    } else {
        alert("No cars found for that city within your selected dates.");
    }
}

// Backend request for car information
async function getCars() {
    try {
        const response = await fetch('/api/cars')

        const xmlCars = await response.json()
        return xmlCars
    } catch (err) {
        console.error('Error fetching cars:', err)
    }
}

// Formatted table for avaliable cars
function createCarObj(id, city, carType, checkin, checkout, price) {
    const days = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);
    const totalPrice = price * days;
    const trCar = document.createElement('tr')
    trCar.appendChild(createTextCell(id))
    trCar.appendChild(createTextCell(city))
    trCar.appendChild(createTextCell(carType))
    trCar.appendChild(createTextCell(checkin))
    trCar.appendChild(createTextCell(checkout))
    trCar.appendChild(createTextCell(`$${price}`));
    trCar.appendChild(createTextCell(`$${totalPrice}`));
    const cartCell = createButtonCell("Add to cart")
    cartCell.addEventListener("click", () => {
    addCarToCart(id, city, carType, checkin, checkout, price)
    })
    trCar.appendChild(cartCell)
    return trCar
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

function revealCarLabels() {
    document.querySelector("#cars-table").classList.remove("hidden")
}

// Sends the selected car to the cart page
function addCarToCart(id, city, carType, checkin, checkout, price) {    
    const cartItem = {
        type: 'car',
        userId: getUserId(),
        carId: id,
        city: city,
        carType: carType,
        checkin: checkin,
        checkout: checkout,
        pricePerDay: price,
    };
    
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart.push(cartItem);
    sessionStorage.setItem('cart', JSON.stringify(cart));

    alert('Car added to cart!');
}

function getUserId() {
    let userId = sessionStorage.getItem('userId');
    if (!userId) {
        userId = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('userId', userId);
    }
    return userId;
}

async function getLastBooking(userId) {
    try {
        const response = await fetch(`/api/carbookings/${userId}`);
        const data = await response.json();
        const bookings = data.bookings.booking || [];
        
        if (bookings.length > 0) {
            // Return the last booking
            return bookings[bookings.length - 1];
        }
        return null;
    } catch (err) {
        console.error('Error fetching last booking:', err);
        return null;
    }
}

async function autofillFromLastBooking() {
    const userId = getUserId();
    const lastBooking = await getLastBooking(userId);
    
    if (lastBooking) {
        const city = lastBooking.city[0];
        const carType = lastBooking.carType[0];
        
        document.getElementById('city').value = city + ', TX'; // Assuming state
        document.getElementById('car-type').value = carType;
    }
}