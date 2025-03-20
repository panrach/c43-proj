const baseUrl = 'http://localhost:3000';

export const checkAuthStatus = async (loadHomepage, loadAuth, logSessionCookie) => {
    try {
        const response = await fetch(`${baseUrl}/auth/status`, {
            credentials: 'include' // Include credentials for session handling
        });
        const status = await response.text();
        logSessionCookie(); // Log the session cookie
        if (status.startsWith('Logged in as')) {
            const parts = status.split(' ');
            const username = parts[3]; // Extract username from status message
            const userId = parts[4]; // Extract userId from status message
            // // store the userId in local storage
            localStorage.setItem('userId', userId);
            loadHomepage(username, userId);
        } else {
            loadAuth();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
    }
};

export const registerUser = async (e, checkAuthStatus, logSessionCookie) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    try {
        const response = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, email }),
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.json();
        logSessionCookie(); // Log the session cookie
        if (response.ok) {
            // Clear input fields
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('reg-email').value = '';
            checkAuthStatus(); // Update UI after registration
        } else {
            alert(result.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Error registering user:', error);
    }
};

export const loginUser = async (e, checkAuthStatus, logSessionCookie) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `username=${username}&password=${password}`,
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.text();
        logSessionCookie(); // Log the session cookie
        if (response.ok) {
            // Clear input fields
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            checkAuthStatus(); // Update UI after login
        } else {
            alert(result || 'Login failed');
        }
    } catch (error) {
        console.error('Error logging in:', error);
    }
};

export const logoutUser = async (loadAuth, logSessionCookie) => {
    try {
        const response = await fetch(`${baseUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.text();
        logSessionCookie(); // Log the session cookie
        // Clear local storage
        localStorage.clear();
        loadAuth();
    } catch (error) {
        console.error('Error logging out:', error);
    }
};