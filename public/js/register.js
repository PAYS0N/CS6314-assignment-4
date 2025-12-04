// Allow the page to load before using event listeners
window.addEventListener("load", () => {
    setupRegistrationListeners()
});

// Attaches event listeners to the form
function setupRegistrationListeners() {
    document.querySelector('#registration-form').addEventListener("submit", (e) => {
        submitRegistrationForm(e)
    })
}

// Takes in user inputs for the form. Returns errors for invalid inputs, displays info and sends it to backend if valid
async function submitRegistrationForm(e) {
    e.preventDefault()
    // Extract values from the form
    const formData = new FormData(document.querySelector("#registration-form"));

    const firstName = formData.get("first-name")
    const lastName = formData.get("last-name")
    const phone = formData.get("phone")
    const email = formData.get("email")
    const password = formData.get("password")
    const passwordRetyped = formData.get("password-retype")
    const gender = formData.get("gender")
    const dob = formData.get("dob")
    const dobFormatted = convertDateFormat(dob)

    if (firstName === lastName) {
        alert("First and last name must be different.")
    }
    else if (password != passwordRetyped) {
        alert("Password must match.")
    }
    else{
        phoneIsValid = await validatePhone(phone)
        if (!phoneIsValid) {
            alert("Phone number already in use.")
        }
        else {
            if (await writeResultsToServer(phone, password, firstName, lastName, dobFormatted, gender, email)) {
                sendToLogin()
            }
        }
    }
}

function convertDateFormat(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year}`;
}

async function validatePhone(phone) {
    try {
        const response = await fetch(`/api/check-phone/${encodeURIComponent(phone)}`);
        const data = await response.json();
        return !data.exists; // Returns true if phone is available
    } catch (error) {
        console.error("Error validating phone:", error);
        return false;
    }
}

function sendToLogin() {
    window.location.href = "./login.html"
}

async function writeResultsToServer(phone, password, firstName, lastName, dob, gender, email) {
    const userInput = { phone, password, firstName, lastName, dob, gender, email };

    try {
        const response = await fetch("/api/registration", {
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
            alert("Information saved successfully!");
            return true;
        } else {
            alert("Something went wrong saving your data.");
            return false;
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while saving your data.");
        return false;
    }
}