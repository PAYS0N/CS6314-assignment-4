window.addEventListener("load", () => {
    setupLoginListeners();
});

function setupLoginListeners() {
    document.querySelector('#login-form').addEventListener("submit", (e) => {
        submitLoginForm(e);
    });
}

async function submitLoginForm(e) {
    e.preventDefault();
    
    const formData = new FormData(document.querySelector("#login-form"));
    const phone = formData.get("phone");
    const password = formData.get("password");
    
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ phone, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user info in sessionStorage
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('userPhone', data.user.phone);
            sessionStorage.setItem('userFirstName', data.user.firstName);
            sessionStorage.setItem('userLastName', data.user.lastName);
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('gender', data.user.gender);
            sessionStorage.setItem('dob', data.user.dob);
            sessionStorage.setItem('isAdmin', data.user.phone === '222-222-2222' ? 'true' : 'false');
            
            alert("Login successful!");
            window.location.href = "../index.html"; // Redirect to home
        } else {
            alert(data.error || "Login failed. Please check your credentials.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while logging in.");
    }
}