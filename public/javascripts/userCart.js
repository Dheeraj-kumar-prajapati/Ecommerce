function calculateTotalCartPrice() {
    let totalCartPrice = 0;
    const cartItems = document.querySelectorAll('.cart-item');

    cartItems.forEach(cartItem => {
        const totalPriceElement = cartItem.querySelector('.totalPrice');

        const price = parseFloat(totalPriceElement.textContent.replace('Rs', ''));

        totalCartPrice += price;
    });

    console.log("sub total :", totalCartPrice);
    return totalCartPrice;
}

document.querySelectorAll('.delete-button button').forEach(button => {
    button.addEventListener('click', () => {
        const cartItem = button.closest('.cart-item');

        const productId = cartItem.id;

        console.log("Product ID:", productId);
        try {
            fetch('/addTo/remove-from-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    const product = document.getElementById(`${productId}`);
                    product.remove();
                    const subTotal = document.getElementById('subTotal');
                    subTotal.innerText = calculateTotalCartPrice();
                })
                .catch(error => {
                    console.error('Error in :', error);
                });
        } catch {
            console.error("error in add to cart");
        }

    });
});

document.addEventListener('DOMContentLoaded', () => {
    const subTotal = document.getElementById('subTotal');
    subTotal.innerText = calculateTotalCartPrice();
})

document.querySelectorAll('.increase-btn').forEach(button => {
    button.addEventListener('click', () => {
        const cartItem = button.closest('.cart-item');
        const input = cartItem.querySelector('input[type="number"]');
        const totalPrice = cartItem.querySelector('.totalPrice');
        const productPrice = cartItem.querySelector('.product-price span:nth-child(2)').textContent.replace('Rs', '');

        const productId = cartItem.id;

        console.log("product price :", productPrice);
        console.log("total price : ", totalPrice);
        const value = parseInt(input.value);

        try {
            fetch('/addTo/increase-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, value })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    input.value = parseInt(input.value) + 1;
                    totalPrice.innerHTML = `Rs${(parseInt(input.value) * parseFloat(productPrice)).toFixed(2)}`;
                    const subTotal = document.getElementById('subTotal');
                    subTotal.innerText = calculateTotalCartPrice();
                })
                .catch(error => {
                    alert("product limit reached");
                    console.error('Error in :', error);
                });
        } catch {
            console.error("error in add to cart");
        }
    });
});


document.querySelectorAll('.decrease-btn').forEach(button => {
    button.addEventListener('click', () => {
        const cartItem = button.closest('.cart-item');
        const input = cartItem.querySelector('input[type="number"]');
        const totalPrice = cartItem.querySelector('.totalPrice');
        const productPrice = cartItem.querySelector('.product-price span:nth-child(2)').textContent.replace('Rs', '');

        const productId = cartItem.id;

        console.log("Product ID:", productId);
        if (parseInt(input.value) > 1) {
            try {
                fetch('/addTo/decrease-product', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        input.value = parseInt(input.value) - 1;
                        totalPrice.innerHTML = `Rs${(parseInt(input.value) * parseFloat(productPrice)).toFixed(2)}`;
                        const subTotal = document.getElementById('subTotal');
                        subTotal.innerText = calculateTotalCartPrice();

                    })
                    .catch(error => {
                        console.error('Error in :', error);
                    });
            } catch {
                console.error("error in add to cart");
            }
        }
        else {
            fetch('/addTo/reset-quantity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error('Error in :', error);
                });

            cartItem.remove();

            const subTotal = document.getElementById('subTotal');
            subTotal.innerText = calculateTotalCartPrice();
        }
    });
});
