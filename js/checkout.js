document.addEventListener('DOMContentLoaded', loadCheckoutProduct);

async function loadCheckoutProduct(){
    const slug = new URLSearchParams(window.location.search).get('slug');
    const productBox = document.getElementById('checkout-product');
    const summaryProduct = document.getElementById('summary-product');
    const priceBox = document.getElementById('summary-price');
    const totalBox = document.getElementById('summary-total');

    if(!slug){
        productBox.textContent = 'No product was selected.';
        return;
    }

    const {data: watch, error} = await supabaseClient
        .from('watches')
        .select('*')
        .eq('slug', slug)
        .single();

    if(error || !watch){
        productBox.textContent = 'Unable to load this product.';
        return;
    }

    productBox.innerHTML = `
        <img src="${watch.image}" alt="${watch.model}">
        <div>
            <p>${watch.brand}</p>
            <h3>${watch.model}</h3>
            <strong>${watch.new_price}</strong>
        </div>
    `;

    summaryProduct.textContent = `${watch.brand} — ${watch.model}`;
    priceBox.textContent = watch.new_price;
    totalBox.textContent = watch.new_price;

    document.getElementById('checkout-form').addEventListener('submit', event => {
        event.preventDefault();

        if(!event.currentTarget.checkValidity()){
            event.currentTarget.reportValidity();
            return;
        }

        sessionStorage.setItem('chronolux-checkout', JSON.stringify({
            slug: watch.slug,
            brand: watch.brand,
            model: watch.model,
            price: watch.new_price,
            customer: {
                name: document.getElementById('customer-name').value.trim(),
                email: document.getElementById('customer-email').value.trim(),
                phone: document.getElementById('customer-phone').value.trim()
            },
            shipping: {
                country: document.getElementById('shipping-country').value.trim(),
                state: document.getElementById('shipping-state').value.trim(),
                address: document.getElementById('shipping-address').value.trim(),
                city: document.getElementById('shipping-city').value.trim(),
                postal: document.getElementById('shipping-postal').value.trim()
            }
        }));

        alert('Your order details are ready. Secure payment will be connected in the next checkout phase.');
    });
}
