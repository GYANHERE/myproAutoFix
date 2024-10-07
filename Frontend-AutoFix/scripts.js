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
        localStorage.setItem('isLoggedIn', 'true');

        alert(result.message);
        if (type === 'login' || type === 'signup') {
            updateLoginButton();
            window.location.href = '/landing-page';
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
    }
}

// Function to update the login button state
function updateLoginButton() {
    const loginButton = document.getElementById('login-signup-button');
    if (localStorage.getItem('isLoggedIn') === 'true') {
        loginButton.innerText = "Logout";
    } else {
        loginButton.innerText = "Login / Sign Up";
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
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Logout logic
        localStorage.removeItem('userSession');
        localStorage.setItem('isLoggedIn', 'false');
        updateLoginButton();
        alert("Logout successful!");
    } else {
        openModal('loginModal');
    }
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

document.addEventListener('DOMContentLoaded', function () {
    // Check user session on page load
    updateLoginButton();

    // Check for restricted navigation clicks
    document.querySelectorAll('.restricted-nav').forEach(function (navLink) {
        navLink.addEventListener('click', function (event) {
            // Check if the user is logged in
            if (!localStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn') === 'false') {
                // Prevent default navigation
                event.preventDefault();
                // Open login/signup popup
                openModal('loginModal');
            }
        });
    });
});
// Show signup modal
function showSignup() {
    closeModal('loginModal'); // Ensure the login modal is closed
    openModal('signupModal'); // Open the signup modal
}
