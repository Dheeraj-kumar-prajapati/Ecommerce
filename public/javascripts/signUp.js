const form = document.getElementById('signUp-form');


function isValidPassword(password) {
    const length = password.length >= 8;

    const lowercase = password.match(/[a-z]/) !== null;

    const number = password.match(/[0-9]/) !== null;

    const specialSymbol = password.match(/[!@#$%^&*(),.?":{}|<>]/) !== null;

    if (length && lowercase && number && specialSymbol) {
        return true;
    } else {
        return false;
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const email = formData.get('email');
    const name = formData.get('name');
    const password = formData.get('password');

    console.log("Submitting signup form");

    if (isValidPassword(password)) {
        try {
            console.log("User details:", email, password, name);
            fetch('/operation/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, name, password })
            })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        return response.json();
                    }
                })
                .then(data => {
                    if (data.message) {
                        document.getElementById('error-message').innerText = data.message;
                    }
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                    document.getElementById('error-message').innerText = "An error occurred during signup. Please try again.";
                });
        } catch (error) {
            console.error("Error during signup submission:", error);
        }

    } else {
        document.getElementById('error-message').innerText = 'password at least 8 digit ( [a to z] [0 to 9] [symbols] )';
    }
});