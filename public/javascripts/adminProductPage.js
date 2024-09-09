document.addEventListener('DOMContentLoaded', function () {
    const productContainer = document.querySelector('.card-container');

    productContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete')) {
            const productId = e.target.getAttribute('data-product-id');

            if (confirm('Are you sure you want to delete this product?')) {
                fetch(`/admin/delete-product/${productId}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json().then(result => ({ response, result })))
                    .then(({ response, result }) => {
                        if (response.ok) {
                            alert('Product deleted successfully!');
                            document.getElementById(`product-${productId}`).remove();
                        } else {
                            alert('Failed to delete product: ' + result.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while deleting the product. Please try again.');
                    });
            }
        }
    });



    // productContainer.addEventListener('click', function (e) {
    //     if (e.target.classList.contains('btn-update')) {
    //         const productId = e.target.getAttribute('data-product-id');
    //         document.getElementById('error-message').innerText = '';

    //         fetch(`/admin/product/${productId}`)
    //             .then(response => response.json().then(product => ({ response, product })))
    //             .then(({ response, product }) => {
    //                 if (response.ok) {
    //                     document.getElementById('update-product-id').value = product._id;
    //                     document.getElementById('update-productName').value = product.productName;
    //                     document.getElementById('update-productDescription').value = product.description;
    //                     document.getElementById('update-price').value = product.price;
    //                     document.getElementById('update-productImage').value = product.image;

    //                     $('#updateProductModal').modal('show');
    //                 } else {
    //                     alert('Failed to fetch product details: ' + product.error);
    //                 }
    //             })
    //             .catch(error => {
    //                 console.error('Error:', error);
    //                 alert('An error occurred while fetching the product details. Please try again.');
    //             });
    //     }
    // });

    let originalProductName;
    let originalPrice;
    let originalProductDescription;
    let originalProductQuantity;

    productContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-update')) {

            const productId = e.target.getAttribute('data-product-id');
            document.getElementById('error-message').innerText = '';

            const productCard = document.getElementById(`product-${productId}`);
            const productName = productCard.querySelector('.card-title').innerText.trim();
            const productDescription = productCard.querySelector('.card-text').innerText.trim();
            const price = productCard.querySelector('.card-price').innerText.replace('$', '').trim();
            const productQuantity = parseInt(productCard.querySelector('.card-quantity').innerText.trim());

            originalProductName = productName;
            originalPrice = price;
            originalProductDescription = productDescription;
            originalProductQuantity = productQuantity.toString();

            document.getElementById('update-product-id').value = productId;
            document.getElementById('update-productName').value = productName;
            document.getElementById('update-productDescription').value = productDescription;
            document.getElementById('update-price').value = price;
            document.getElementById('update-quantity').value = productQuantity;

            $('#updateProductModal').modal('show');
        }
    });

    document.getElementById('update-product-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const productId = document.getElementById('update-product-id').value.trim();
        const productName = document.getElementById('update-productName').value.trim();
        const productDescription = document.getElementById('update-productDescription').value.trim();
        const price = document.getElementById('update-price').value.trim();
        const productQuantity = document.getElementById('update-quantity').value.trim();

        if (price <= 0) {
            document.getElementById('error-message').innerText = 'Price should not be negative or 0';
            return;
        }

        if (productQuantity <= 0) {
            document.getElementById('error-message').innerText = 'Quantity should not be negative or 0';
            return;
        }
        // console.log("org : ", originalPrice, originalProductDescription, originalProductName, originalProductQuantity);
        // console.log("new : ", price, productDescription, productName, productQuantity)

        if (originalPrice === price &&
            originalProductDescription === productDescription &&
            originalProductName === productName &&
            originalProductQuantity === productQuantity) {
            $('#updateProductModal').modal('hide');
            return;
        }

        fetch(`/admin/update-product/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productName,
                productDescription,
                price,
                productQuantity
            })
        })
            .then(response => response.json().then(result => ({ response, result })))
            .then(({ response, result }) => {
                if (response.ok) {
                    alert('Product updated successfully!');
                    $('#updateProductModal').modal('hide');

                    const productCard = document.getElementById(`product-${productId}`);
                    productCard.querySelector('img').src = result.product.image;
                    productCard.querySelector('.card-title').innerText = result.product.productName;
                    productCard.querySelector('.card-text').innerText = result.product.description;
                    productCard.querySelector('.card-price').innerText = `$${result.product.price}`;
                    productCard.querySelector('.card-quantity').innerText = result.product.stock;
                } else {
                    alert('Failed to update product: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating the product. Please try again.');
            });
    });


});