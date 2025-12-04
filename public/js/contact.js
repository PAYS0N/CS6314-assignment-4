// Allow the page to load before using event listeners
window.addEventListener("load", () => {
    setupContactListeners()
});

function isUserLoggedIn() {
    return sessionStorage.getItem('loggedIn') === 'true';
}   

// Attaches event listeners to every contact form
function setupContactListeners() {
    document.querySelector('#contact-form').addEventListener("submit", (e) => {
        if (!isUserLoggedIn()) {
            alert("You must be logged in to submit a comment.");
            return;
        }
        submitContactForm(e)
    })
}

// Displays contact information on the page upon a valid submission
function displayContactResults() {
    alert("Comment submitted!")
}

// Takes in user inputs for the contact form. Returns errors for invalid inputs, displays info and sends it to backend if valid
function submitContactForm(e) {
    e.preventDefault()
    // Extract values from the form
    const formData = new FormData(document.querySelector("#contact-form"));
    const comment = formData.get("comment")
    const commentRegex = /^.{10}.*$/
    if (!commentRegex.test(comment)) {
        alert("Comment must be at least 10 characters long.")
    }
    else {
    displayContactResults(comment)
    writeResultsToServer(comment)
    }
}

// Sends the contact info to the backend server and saves it in contacts.json
function writeResultsToServer(comment) {
    const phone = sessionStorage.getItem('userPhone');
    const firstName = sessionStorage.getItem('userFirstName');
    const lastName = sessionStorage.getItem('userLastName');
    const email = sessionStorage.getItem('userEmail');
    const gender = sessionStorage.getItem('gender')
    
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
            alert("Information saved successfully!");
        } else {
            alert("Something went wrong saving your contact data.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred while saving your contact data.");
    });
}
