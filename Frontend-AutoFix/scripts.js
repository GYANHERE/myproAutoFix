console.log('Script loaded');
console.log("JavaScript is successfully linked!");

// Form validation and submission
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (validateForm(loginForm)) {
        const data = {
            username: loginForm.username.value,
            password: loginForm.password.value
        };
        await handleFormSubmission('http://localhost:3000/login', data);
    }
});

signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (validateForm(signupForm)) {
        const data = {
            username: signupForm['new-username'].value,
            password: signupForm['new-password'].value
        };
        await handleFormSubmission('http://localhost:3000/signup', data);
    }
});

// Validation function
function validateForm(form) {
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;

    if (username === '' || password === '') {
        alert('Please fill out all fields.');
        return false;
    }
    // Add additional validation rules as needed
    return true;
}

// Example AJAX function to handle form submission
async function handleFormSubmission(url, data) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.text();
        alert(result);
    } catch (error) {
        alert('An error occurred.');
    }
}

// Function to simulate finding mechanics based on location
document.getElementById('find-mechanics-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const location = document.getElementById('location-input').value;

    // Simulating mechanic search (in a real case, you would use an API to get mechanics)
    const mechanics = [
        { name: "John's Auto Service", location: location, rating: 4.8 },
        { name: "Speedy Repair", location: location, rating: 4.5 },
        { name: "Expert Mechanics", location: location, rating: 4.9 }
    ];

    const mechanicsListDiv = document.getElementById('mechanics-list');
    mechanicsListDiv.innerHTML = ''; // Clear previous results

    // Display each mechanic in the list
    mechanics.forEach(function(mechanic) {
        const mechanicItem = document.createElement('div');
        mechanicItem.classList.add('mechanic-item');
        mechanicItem.innerHTML = `
            <h3>${mechanic.name}</h3>
            <p>Location: ${mechanic.location}</p>
            <p>Rating: ${mechanic.rating} &#9733;</p>
        `;
        mechanicsListDiv.appendChild(mechanicItem);
    });
});

// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 13); // Default location (London)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to center map on user's current location
document.getElementById('use-my-location').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;

            // Center the map on the user's location
            map.setView([userLat, userLng], 13);

            // Add a marker at the user's location
            var userMarker = L.marker([userLat, userLng]).addTo(map);
            userMarker.bindPopup("<b>You are here!</b>").openPopup();
        }, function() {
            alert("Geolocation failed. Please allow location access or try again.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});
// Function to show a specific modal
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
    document.getElementById(modalId).classList.add('show');
}

// Function to close a specific modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById(modalId).classList.remove('show');
}

// Show login modal
document.getElementById('login-signup-button').addEventListener('click', function() {
    openModal('loginModal');
});

// Show signup modal
function showSignup() {
    closeModal('loginModal');
    openModal('signupModal');
}

// Show login modal from signup
function showLogin() {
    closeModal('signupModal');
    openModal('loginModal');
}
