
async function accountInfo(event) {
    event.preventDefault();
    const username = document.getElementById('username').innerText;
    const password = document.getElementById('new-password').innerText;
    const passwordConfirm = document.getElementById('confirm-password').innerText;
    const oldPassword = document.getElementById('old-password').innerText;
    try {
        if (password !== passwordConfirm) {
            alert('Passwords do not match!');
            return false;
        }
        const response = await fetch('http://localhost:7090/account/account_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                username,
                password,
                oldPassword,
            }),
        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        window.location.href = 'profile.html';
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating your account information.');
    }
    return false;
}

async function profileInfo(event) {
    event.preventDefault();
    const email = document.getElementById('email').innerText;
    const bio = document.getElementById('bio').innerText;
    const country = document.getElementById('country').innerText;
    try {
        const response = await fetch('http://localhost:7090/account/profile_info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                email,
                bio,
                country
            }),
        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating your profile information.');
    }

    return false;
}

async function retrieveAccountData() {

    try {
        const response = await fetch('http://localhost:7090/account', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },

        });

        if (!response.ok) {
            throw new Error(`${response.status}`);
        }
        const account = await response.json();
        document.getElementById('username').value = account.username;
        if (account.email !== null) {
            document.getElementById('email').value = account.email;
        }
        if (account.bio !== null) {
            document.getElementById('bio').value = account.bio;
        }
        if (account.country !== null) {
            document.getElementById('country').value = account.country;
        }

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating your profile information.');
    }
}

retrieveAccountData();