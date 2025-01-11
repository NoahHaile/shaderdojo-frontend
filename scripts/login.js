async function register(event) {
    event.preventDefault();

    const username = document.getElementById('username-signup').value;
    const password = document.getElementById('password-signup').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return false;
    }

    try {
        const response = await fetch('http://localhost:7091/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, captcha: "123", captchaHash: "sdfasf" }),
        });
        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const token = await response.text();
        localStorage.setItem('token', token);

        const redirect = new URLSearchParams(window.location.search).get('redirect');

        if (redirect)
            window.location.href = redirect;
        else
            window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating your account.');
    }

    return false;
}

async function login(event) {

    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:7091/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const token = await response.text();
        localStorage.setItem('token', token);

        const redirect = new URLSearchParams(window.location.search).get('redirect');

        if (redirect)
            window.location.href = redirect;
        else
            window.location.href = 'index.html';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating your account.');
    }

    return false;
}
