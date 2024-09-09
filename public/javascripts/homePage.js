document.addEventListener('DOMContentLoaded', () => {
    const btns = document.getElementsByClassName('btn-primary');
    const detailCard = document.querySelector('.detail-card');
    const crossIcon = document.getElementById('crossIcon');
    const addToCart = document.querySelector('.add-to-cart-btn');
    let page = 2;

    const attachAddToCartListener = () => {
        addToCart.addEventListener('click', () => {
            const productId = detailCard.id;
            console.log("Product ID:", productId);
            try {
                fetch('/addTo/add-to-cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ productId })
                })
                    .then(response => {
                        if (!response.ok) {
                            console.log(response)
                            if (response.status === 500)
                                window.location.href = "http://localhost:3000/login";

                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        alert("Product added");
                        detailCard.style.display = 'none';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
            } catch (error) {
                console.error("Error in add to cart:", error);
            }
        });
    };

    Array.from(btns).forEach((btn) => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.card');
            const productName = card.querySelector('.card-title').textContent;
            const productPrice = card.querySelector('#price').textContent;
            const productDescription = card.querySelector('#description').textContent;
            const productImage = card.querySelector('img').src;
            const productId = card.id;
            const productStock = card.querySelector('#stock').textContent;

            console.log("stock : ", parseInt(productStock));

            detailCard.querySelector('.product-title').textContent = productName;
            detailCard.querySelector('.product-price').textContent = productPrice;
            detailCard.querySelector('.product-description').textContent = productDescription;
            detailCard.querySelector('.detail-card-image img').src = productImage;
            detailCard.querySelector('.product-stock').textContent = productStock.trim();

            // if (parseInt(productStock) === 0) {
            //     document.querySelector('.add-to-cart-btn').setAttribute('disabled', 'true');
            // }
            // else {
            //     document.querySelector('.add-to-cart-btn').removeAttribute('disabled');
            // }

            detailCard.id = productId;
            detailCard.style.display = 'block';
        });
    });

    const showMoreBtn = document.getElementById('showMore');

    showMoreBtn.addEventListener('click', () => {
        fetch(`/getProducts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ page })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                const mainContainer = document.getElementById('main-container');
                if (data.length < 5) {
                    showMoreBtn.style.display = 'none';
                    // alert('No more data to show');
                    // return;
                }

                const imageContainer = document.createElement('div');
                imageContainer.id = 'image-container';

                data.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.width = '15rem';
                    card.id = product._id;

                    const img = document.createElement('img');
                    img.src = product.image;
                    img.className = 'card-img-top';
                    img.alt = '';

                    const cardBody = document.createElement('div');
                    cardBody.className = 'card-body';

                    const title = document.createElement('h5');
                    title.className = 'card-title';
                    title.textContent = product.productName;

                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'btn-primary';
                    button.textContent = 'View Details';

                    const span = document.createElement('span');
                    span.id = 'price';
                    span.innerText = product.price;

                    const p = document.createElement('p');
                    p.id = 'description';
                    p.innerText = product.description;

                    const stock = document.createElement('p');
                    stock.id = 'stock';
                    stock.innerText = product.stock;
                    stock.style.display = 'none';


                    cardBody.appendChild(title);
                    cardBody.appendChild(button);
                    cardBody.appendChild(span);
                    cardBody.appendChild(p);
                    card.appendChild(img);
                    card.appendChild(stock);
                    card.appendChild(cardBody);

                    imageContainer.appendChild(card);

                    button.addEventListener('click', () => {
                        detailCard.querySelector('.product-title').textContent = product.productName;
                        detailCard.querySelector('.product-price').textContent = product.price;
                        detailCard.querySelector('.product-description').textContent = product.description;
                        detailCard.querySelector('.detail-card-image img').src = product.image;
                        detailCard.querySelector('.product-stock').textContent = product.stock;

                        console.log("p stock : ", product.stock);

                        // if (parseInt(product.stock) === 0) {
                        //     document.querySelector('.add-to-cart-btn').setAttribute('disabled', 'true');
                        // }
                        // else {
                        //     document.querySelector('.add-to-cart-btn').removeAttribute('disabled');
                        // }

                        detailCard.id = product._id;
                        detailCard.style.display = 'block';
                    });
                });

                mainContainer.appendChild(imageContainer);
                page++;

            })
            .catch(error => console.error('Error:', error));
    });

    crossIcon.addEventListener('click', () => {
        detailCard.style.display = 'none';
        detailCard.removeAttribute('id');
    });

    attachAddToCartListener();
});
