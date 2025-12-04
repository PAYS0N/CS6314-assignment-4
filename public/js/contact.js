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

// Takes in user inputs for the contact form. Returns errors for invalid inputs, displays info and sends it to backend if valid
function submitContactForm(e) {
    e.preventDefault()

    const formData = new FormData(document.querySelector("#contact-form"));
    const comment = formData.get("comment")
    writeResultsToServer(comment)
}

// Sends the contact info to the backend server and saves it in contacts.json
async function writeResultsToServer(comment) {
    const phone = sessionStorage.getItem('userPhone');
    const firstName = sessionStorage.getItem('userFirstName');
    const lastName = sessionStorage.getItem('userLastName');
    const email = sessionStorage.getItem('userEmail');
    const dob = sessionStorage.getItem('dob');
    const gender = sessionStorage.getItem('gender');
    
    const userInput = { firstName, lastName, phone, gender, email, dob, comment };

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userInput)
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        
        if (data.success) {
            alert(`Contact information saved successfully! Your contact ID is: ${data.contactId}`);
            return true;
        } else {
            alert("Something went wrong saving your contact data.");
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving your contact data.");
        return false;
    }
}