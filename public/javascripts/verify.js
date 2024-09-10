
document.addEventListener('DOMContentLoaded', function () {
    const otpForm = document.getElementById('otpForm');
    const errorMessage = document.getElementById('errorMessage');


    otpForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const otp = document.getElementById('otp').value;
        const otpLenght = 4;

        if (otp.length === otpLenght) {

            console.log('OTP entered:', otp);

            fetch('/opertion/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ otp })
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        errorMessage.textContent = data.error;
                    } else {
                        alert("Sign up done")
                        window.location.href = '/login';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    errorMessage.textContent = 'OTP verification failed. Please try again.';
                });
        } else {
            errorMessage.textContent = 'Please enter 4 digits OTP.';
        }
    });

    const resendButton = document.getElementById('resendOtpLink');

    resendButton.addEventListener('click', () => {
        console.log('Resending OTP...');
        errorMessage.innerHTML = '';
        otpInputs.forEach(e => {
            e.value = '';
        })

        fetch('/opertion/resend-otp', {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    errorMessage.innerHTML = `<a href="${data.redirectTo}">${data.error}</a>`;
                } else if (data.user && data.token) {
                    alert('OTP verified successfully');
                    window.location.href = 'http://localhost:3000/login';
                } else {
                    throw new Error('Unexpected server response');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.textContent = 'Failed to resend OTP. Please try again.';
            });
    });

});
