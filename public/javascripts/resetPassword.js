const errorMessage = document.getElementById('errorMessage');

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

document.getElementById('resetPasswordForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;


    if (newPassword === confirmPassword) {

        if (isValidPassword(newPassword)) {

            try {
                fetch('/operation/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ newPassword })
                })
                    .then(response => {
                        if (response.ok) {
                            console.log("hi");
                            window.location.href = 'http://localhost:3000/login';
                        }
                    })
                    .then(data => {
                        console.log("data : ", data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        errorMessage.textContent = 'Reset Password failed';
                    });
            } catch {
                console.log("catch error");
            }
        }
        else {
            errorMessage.textContent = "password at least 8 digit ( [a to z] [0 to 9] [symbols] )";
        }
    }
    else {
        errorMessage.textContent = "Password's do not match";
    }
})
