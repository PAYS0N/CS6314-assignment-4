window.addEventListener("load", () => {
    checkLoginStatus();
    checkAdminStatus();
});

function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('loggedIn');
    
    if (loggedIn !== 'true') {
        alert('Please login to access your account.');
        window.location.href = './login.html';
    }
}

function checkAdminStatus() {
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin === 'true') {
        document.getElementById('admin-section').style.display = 'block';
    }
}

async function loadFlightsToDatabase() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/admin/load-flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminPhone: adminPhone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message + `\nSuccess: ${data.successCount}, Errors: ${data.errorCount}`);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}

async function loadHotelsToDatabase() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/admin/load-hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ adminPhone: adminPhone })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message + `\nSuccess: ${data.successCount}, Errors: ${data.errorCount}`);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        alert('An error occurred while loading hotels.');
    }
}

async function loadFlightsFromTexas() {
    const adminPhone = sessionStorage.getItem('userPhone');
    const isAdmin = sessionStorage.getItem('isAdmin');
    
    if (isAdmin !== 'true' || adminPhone !== '222-222-2222') {
        alert('Unauthorized. Admin access required.');
        return;
    }
        
    try {
        const response = await fetch('/api/flights/departing');
        
        const data = await response.json();
        
        if (data.success) {
            for (const flight of data.flights) { 
                alert(`Flight ID: ${flight.flightId}`);
            }
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading flights:', error);
        alert('An error occurred while loading flights.');
    }
}
