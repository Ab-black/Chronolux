const PAYMENT_FUNCTION = "paystack-initialize";
const $ = (id) => document.getElementById(id);

function setCheckoutMessage(message, isError = false) {
    const note = document.querySelector(".checkout-note");
    if (!note) return;
    note.textContent = message;
    note.style.color = isError ? "#ef4444" : "#9d9d9d";
}

function getStoredCheckout() {
    try {
        return JSON.parse(sessionStorage.getItem("chronolux-checkout") || "null");
    } catch {
        return null;
    }
}

async function loadCheckoutProduct() {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const productBox = $("checkout-product");
    const summaryProduct = $("summary-product");
    const priceBox = $("summary-price");
    const totalBox = $("summary-total");
    const form = $("checkout-form");

    if (!slug) {
        productBox.textContent = "No product was selected.";
        return;
    }

    const { data: watch, error } = await supabaseClient
        .from("watches")
        .select("id, brand, model, slug, new_price, image")
        .eq("slug", slug)
        .single();

    if (error || !watch) {
        productBox.textContent = "Unable to load this product.";
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

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const button = form.querySelector(".checkout-submit");
        button.disabled = true;
        button.textContent = "Preparing Secure Payment...";
        setCheckoutMessage("Creating your secure order and preparing payment...");

        try {
            // Only the product slug is trusted from the browser.
            // The server-side order function determines the real product price.
            const { data: order, error: orderError } = await supabaseClient.rpc(
                "create_chronolux_order",
                {
                    p_product_slug: slug,
                    p_customer_name: $("customer-name").value.trim(),
                    p_customer_email: $("customer-email").value.trim(),
                    p_customer_phone: $("customer-phone").value.trim(),
                    p_shipping_country: $("shipping-country").value.trim(),
                    p_shipping_state: $("shipping-state").value.trim(),
                    p_shipping_address: $("shipping-address").value.trim(),
                    p_shipping_city: $("shipping-city").value.trim(),
                    p_shipping_postal: $("shipping-postal").value.trim()
                }
            );

            if (orderError) throw orderError;

            const createdOrder = Array.isArray(order) ? order[0] : order;
            if (!createdOrder?.order_id) throw new Error("Order could not be created.");

            const callbackUrl = `${window.location.origin}${window.location.pathname}`;

            const { data: payment, error: paymentError } = await supabaseClient.functions.invoke(
                PAYMENT_FUNCTION,
                {
                    body: {
                        order_id: createdOrder.order_id,
                        callback_url: callbackUrl
                    }
                }
            );

            if (paymentError) throw paymentError;
            if (!payment?.authorization_url) throw new Error("Payment could not be initialized.");

            // Store only the information needed by the confirmation screen.
            // Payment verification itself remains server-side.
            sessionStorage.setItem("chronolux-checkout", JSON.stringify({
                order_id: createdOrder.order_id,
                order_number: createdOrder.order_number,
                payment_reference: payment.reference,
                product: {
                    brand: watch.brand,
                    model: watch.model,
                    slug: watch.slug,
                    price: watch.new_price,
                    image: watch.image
                },
                customer: {
                    name: $("customer-name").value.trim(),
                    email: $("customer-email").value.trim(),
                    phone: $("customer-phone").value.trim()
                },
                shipping: {
                    country: $("shipping-country").value.trim(),
                    state: $("shipping-state").value.trim(),
                    address: $("shipping-address").value.trim(),
                    city: $("shipping-city").value.trim(),
                    postal: $("shipping-postal").value.trim()
                }
            }));

            window.location.href = payment.authorization_url;
        } catch (error) {
            console.error("Checkout error:", error);
            setCheckoutMessage(
                error?.message || "We could not start the payment. Please try again.",
                true
            );
            button.disabled = false;
            button.textContent = "Pay Now";
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const reference = new URLSearchParams(window.location.search).get("reference");

    // Paystack returns the customer here after payment. Move immediately to the
    // dedicated confirmation page so checkout.html remains a purchase form only.
    if (reference) {
        const stored = getStoredCheckout();
        if (stored) {
            stored.payment_reference = reference;
            sessionStorage.setItem("chronolux-checkout", JSON.stringify(stored));
        }

        window.location.replace(`confirmation.html?reference=${encodeURIComponent(reference)}`);
        return;
    }

    await loadCheckoutProduct();
});
