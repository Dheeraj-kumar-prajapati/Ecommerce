document.addEventListener('DOMContentLoaded', function () {
    function loadProducts() {
        fetch('/admin/admin-products')
            .then(response => response.json())
            .then(data => {
                if (data.products) {
                    data.products.forEach(product => {
                        if (product) {
                            addProductToDOM(product);
                        } else {
                            console.error('Received null or invalid product:', product);
                        }
                    });
                } else {
                    console.error('Failed to load products:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

    }

    loadProducts();

    document.getElementById('add-product-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const productName = document.getElementById('productName').value;
        const productDescription = document.getElementById('productDescription').value;
        const price = document.getElementById('price').value;
        const quantity = document.getElementById('quantity').value;
        const productImage = document.getElementById('productImage').files[0];

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('price', price);
        formData.append('quantity', quantity);
        formData.append('productImage', productImage);

        if (price <= 0) {
            document.getElementById('error-message').innerText = 'Price should not be negative or 0';
            return;
        }

        if (quantity <= 0) {
            document.getElementById('error-message').innerText = 'Quantity should not be negative or 0';
            return;
        }

        fetch('/admin/add-product', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(result => {
                if (result.product) {
                    // addProductToDOM(result.product);
                    this.reset();
                    alert('Product added successfully!');
                    document.getElementById('error-message').innerText = '';
                } else {
                    alert('Failed to add product: ' + result.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while adding the product. Please try again.');
            });
    });

    function addProductToDOM(product) {
        if (!product || !product._id) {
            console.error('Invalid product:', product);
            return;
        }

        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.id = `product-${product._id}`;

        const imgElement = document.createElement('img');
        imgElement.src = product.image || 'default-image.jpg';
        imgElement.alt = product.productName || 'No name';

        const details = document.createElement('div');
        details.classList.add('details');

        const nameElement = document.createElement('h5');
        nameElement.innerText = product.productName || 'No name';

        const descriptionElement = document.createElement('p');
        descriptionElement.innerText = product.description || 'No description';

        const priceElement = document.createElement('span');
        priceElement.innerText = `$${product.price || '0.00'}`;

        details.appendChild(nameElement);
        details.appendChild(descriptionElement);
        details.appendChild(priceElement);

        const btnContainer = document.createElement('div');
        btnContainer.classList.add('btn-container');

        const updateButton = document.createElement('button');
        updateButton.classList.add('btn', 'btn-primary', 'btn-update');
        updateButton.innerText = 'Update';

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger', 'btn-delete');
        deleteButton.innerText = 'Delete';
        deleteButton.setAttribute('data-product-id', product._id);

        btnContainer.appendChild(updateButton);
        btnContainer.appendChild(deleteButton);

        productItem.appendChild(imgElement);
        productItem.appendChild(details);
        productItem.appendChild(btnContainer);

        document.getElementById('product-list').appendChild(productItem);
    }

    document.getElementById('product-list').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-delete')) {
            const productId = e.target.getAttribute('data-product-id');

            if (confirm('Are you sure you want to delete this product?')) {
                fetch(`/admin/delete-product/${productId}`, {
                    method: 'DELETE'
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
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
});
