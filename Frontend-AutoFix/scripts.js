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
            username: signupForm.signupName.value,
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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Network response was not ok');
        }

        // Store user session in localStorage
        localStorage.setItem('userSession', JSON.stringify(result.user));

        alert(result.message);
        if (type === 'login' || type === 'signup') {
            window.location.href = '/landing-page';
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
document.getElementById('find-mechanics-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const location = document.getElementById('location-input').value;
    searchMechanics(location);
});

// Function to search mechanics based on location
let debounceTimer;
function searchMechanics(location) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetch(`http://localhost:3000/api/find-mechanics?location=${location}`)
            .then(response => response.json())
            .then(data => {
                displayMechanicsList(data.mechanics);
                displayMechanicsOnMap(data.mechanics);
            })
            .catch(error => {
                console.error('Error fetching mechanics:', error);
            });
    }, 300); // Debounce time of 300ms
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
var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to center map on user's current location
document.getElementById('use-my-location').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;

            // Center the map on the user's location
            map.setView([userLat, userLng], 13);

            // Add a marker at the user's location
            var userMarker = L.marker([userLat, userLng]).addTo(map);
            userMarker.bindPopup("<b>You are here!</b>").openPopup();
        }, function () {
            alert("Geolocation failed. Please allow location access or try again.");
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// Function to handle the booking process
document.getElementById('book-mechanic-button').addEventListener('click', function () {
    const location = document.getElementById('location-input').value;

    if (location.trim() === '') {
        alert('Please enter a location.');
        return;
    }

    console.log('User location:', location);
    showVehicleSelection(location);
});

// Function to show vehicle selection
function showVehicleSelection(location) {
    document.getElementById('vehicle-selection').style.display = 'block';

    const vehicleSelectionHeader = document.createElement('h3');
    vehicleSelectionHeader.innerText = `Location: ${location}`;
    document.querySelector('.vehicle-selection-container').prepend(vehicleSelectionHeader);
}

// Sample data for vehicle companies and models
const vehicleData = {
    Car: {
        "Toyota": ["Corolla", "Camry", "Prius"],
        "Honda": ["Civic", "Accord", "CR-V"],
        "Ford": ["Focus", "Mustang", "Explorer"]
    },
    Bike: {
        "Yamaha": ["MT-07", "YZF-R3", "FZ-09"],
        "Honda": ["CBR500R", "CB500F", "Grom"],
        "Bajaj": ["Pulsar NS200", "Dominar 400"]
    },
    Scooter: {
        "Vespa": ["GTS", "Primavera"],
        "Honda": ["Activa", "Dio"],
        "TVS": ["Jupiter", "NTorq"]
    },
    Bullet: {
        "Royal Enfield": ["Classic 350", "Bullet 350", "Himalayan"]
    }
};

// Function to handle vehicle selection
document.querySelectorAll('input[name="vehicle"]').forEach((radio) => {
    radio.addEventListener('change', function () {
        const selectedVehicleType = this.value;
        showCompanyModelSelection(selectedVehicleType);
    });
});

// Function to show company and model selection
function showCompanyModelSelection(vehicleType) {
    const companySelect = document.getElementById('company-select');
    const modelSelect = document.getElementById('model-select');

    // Clear previous options
    companySelect.innerHTML = '<option value="">Select Company</option>';
    modelSelect.innerHTML = '<option value="">Select Model</option>';

    // Populate company options based on selected vehicle type
    const companies = Object.keys(vehicleData[vehicleType]);
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.innerText = company;
        companySelect.appendChild(option);
    });

    // Show the company/model selection section
    document.getElementById('company-model-selection').style.display = 'block';

    // Event listener for company selection
    companySelect.addEventListener('change', function () {
        const selectedCompany = this.value;
        populateModels(selectedCompany, vehicleType);
        showIssueSelection(); // Show issue selection after company/model selection
    });
}

// Function to populate models based on selected company
function populateModels(company, vehicleType) {
    const modelSelect = document.getElementById('model-select');

    // Clear previous options
    modelSelect.innerHTML = '<option value="">Select Model</option>';

    const models = vehicleData[vehicleType][company];
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.innerText = model;
        modelSelect.appendChild(option);
    });
}

// Function to show issue selection
function showIssueSelection() {
    document.getElementById('issue-selection').style.display = 'block';
}

// Function to handle mechanic booking
async function bookMechanic(mechanicId) {
    const vehicleType = document.querySelector('input[name="vehicle"]:checked').value;
    const company = document.getElementById('company-select').value;
    const model = document.getElementById('model-select').value;
    const issue = document.getElementById('issue-select').value;

    if (!vehicleType || !company || !model || !issue) {
        alert('Please fill out all fields before booking.');
        return;
    }

    const bookingData = {
        mechanicId: mechanicId,
        vehicleType: vehicleType,
        company: company,
        model: model,
        issue: issue
    };

    try {
        const response = await fetch('/api/book-mechanic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Booking failed');
        }

        alert(result.message);
    } catch (error) {
        alert('An error occurred during booking: ' + error.message);
    }
}

// Check if user is logged in on page load
window.onload = function () {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        // User is logged in, show logout button and welcome message
        document.getElementById('logout-button').style.display = 'block';
        document.getElementById('login-signup-button').style.display = 'none';
        const user = JSON.parse(userSession);
        document.getElementById('welcome-message').innerText = `Welcome, ${user.username}`;
    }
}

// Logout function
document.getElementById('logout-button').addEventListener('click', function () {
    localStorage.removeItem('userSession');
    alert('You have been logged out.');
    window.location.href = '/index.html'; // Redirect to index.html
});
