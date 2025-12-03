// Allow the page to load before using event listeners
window.addEventListener("load", () => {
    setupRegistrationListeners()
});

// Attaches event listeners to every contact form
function setupRegistrationListeners() {
    document.querySelector('#contact-form').addEventListener("submit", (e) => {
        submitRegistrationForm(e)
    })
}

// Displays contact information on the page upon a valid submission
function displayRegistrationResults(fn, ln, p, g, e, c) {
    const outputDiv = document.querySelector("#contact-output")
    outputDiv.textContent = "Name: " + fn + " " + ln + "\nPhone: " + p + "\nGender: " + g + "\nEmail: " + e + "\nComment: " + c
}

// Takes in user inputs for the contact form. Returns errors for invalid inputs, displays info and sends it to backend if valid
function submitRegistrationForm(e) {
    e.preventDefault()
    // Extract values from the form
    const formData = new FormData(document.querySelector("#contact-form"));
    const firstName = formData.get("first-name")
    const lastName = formData.get("last-name")
    const phone = formData.get("phone")
    const email = formData.get("email")
    const comment = formData.get("comment")
    // Regex for proper input formats as instructed in the assignment
    const nameRegex = /^[A-Z][a-zA-Z]*$/
    const phoneRegex = /^\(\s?\d{3}\s?\)\s?\d{3}\s?-\s?\d{4}$/
    const emailRegex = /^.*@.*\..*$/
    const commentRegex = /^.{10}.*$/
    // Validation of user inputs
    if (firstName === lastName) {
        alert("First and last name must be different.")
    }
    else if (!nameRegex.test(firstName)) {
        alert("First name must start with a capital letter, and contain only letters.")
    }
    else if (!nameRegex.test(lastName)) {
        alert("Last name must start with a capital letter, and contain only letters.")
    }
    else if (!phoneRegex.test(phone)) {
        alert("Phone number must be formatted like so: (###)###-####")
    }
    else if (!emailRegex.test(email)) {
        alert("Email must contain '@' and then '.'.")
    }
    else if (!commentRegex.test(comment)) {
        alert("Comment must be at least 10 characters long.")
    }
    // All validation tests pass, display the text on the page and send the data to the backend
    else {
    displayRegistrationResults(firstName, lastName, phone, formData.get("gender"), email, comment)
    writeResultsToServer(firstName, lastName, phone, formData.get("gender"), email, comment)
    }
}

// Sends the contact info to the backend server and saves it in contacts.json
function writeResultsToServer(firstName, lastName, phone, gender, email, comment) {
    const userInput = { firstName, lastName, phone, gender, email, comment };

    fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userInput)
    })
    // Edge cases for network issues
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    // Inform the user of what happened
    .then(data => {
        if (data.success) {
            alert("Contact information saved successfully!");
        } else {
            alert("Something went wrong saving your contact data.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while saving your contact data.");
    });
}
