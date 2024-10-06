console.log('Script loaded');
console.log("JavaScript is successfully linked!");

// Get the forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Form validation and submission for Login
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (validateForm(loginForm)) {
        const data = {
            email: loginForm.loginEmail.value,
            password: loginForm.loginPassword.value
        };
        await handleFormSubmission('/api/login', data, 'login');
    }
});

// Form validation and submission for Signup
signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (validateForm(signupForm)) {
        const data = {
            username: signupForm.signupName.value, // Corrected key from 'name' to 'username'
            email: signupForm.signupEmail.value,
            password: signupForm.signupPassword.value
        };
        await handleFormSubmission('/api/signup', data, 'signup');
    }
});

// Validation function
function validateForm(form) {
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (email === '' || password === '') {
        alert('Please fill out all fields.');
        return false;
    }
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }
    return true;
}

// AJAX function to handle form submission
async function handleFormSubmission(url, data, type) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json(); // Expecting JSON response

        if (!response.ok) {
            throw new Error(result.message || 'Network response was not ok');
        }

        // Provide feedback and redirect
        alert(result.message); // Assuming the server responds with a message
        if (type === 'login' || type === 'signup') {
            window.location.href = '/user-dashboard'; // Update this to your dashboard URL
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

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
document.getElementById('login-signup-button').addEventListener('click', function () {
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

// Function to find mechanics based on location
document.getElementById('find-mechanics-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    const location = document.getElementById('location-input').value;
    searchMechanics(location); // Fetch mechanics based on input location
});

// Function to search mechanics based on location
function searchMechanics(location) {
    fetch(`http://localhost:3000/api/find-mechanics?location=${location}`)
        .then(response => response.json())
        .then(data => {
            displayMechanicsList(data.mechanics);
            displayMechanicsOnMap(data.mechanics);
        })
        .catch(error => {
            console.error('Error fetching mechanics:', error);
        });
}

// Function to display mechanics list
function displayMechanicsList(mechanics) {
    const list = document.getElementById('mechanics-list');
    list.innerHTML = ''; // Clear previous results
    mechanics.forEach(mechanic => {
        const mechanicItem = document.createElement('div');
        mechanicItem.className = 'mechanic-item';
        mechanicItem.innerHTML = `
            <h3>${mechanic.name}</h3>
            <p>Rating: ${mechanic.rating}</p>
            <p>Distance: ${mechanic.distance} km</p>
            <button onclick="bookMechanic(${mechanic.id})">Book Mechanic</button>
        `;
        list.appendChild(mechanicItem);
    });
}

// Function to display mechanics on the map
function displayMechanicsOnMap(mechanics) {
    mechanics.forEach(mechanic => {
        const marker = L.marker([mechanic.latitude, mechanic.longitude]).addTo(map);
        marker.bindPopup(`<b>${mechanic.name}</b><br>Rating: ${mechanic.rating}`).openPopup();
    });
}

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
