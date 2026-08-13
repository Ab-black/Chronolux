const PAYMENT_FUNCTION = "paystack-initialize";
const VERIFY_FUNCTION = "paystack-verify";

const $ = (id) => document.getElementById(id);

function setCheckoutMessage(message, isError = false) {
    const note = document.querySelector(".checkout-note");
    if (!note) return;
    note.textContent = message;
    note.style.color = isError ? "#ef4444" : "#9d9d9d";
}

async function verifyReturnedPayment() {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) return false;

    const button = document.querySelector(".checkout-submit");
    if (button) {
        button.disabled = true;
        button.textContent = "Verifying Payment...";
    }

    setCheckoutMessage("Verifying your payment securely. Please wait...");

    try {
        const { data, error } = await supabaseClient.functions.invoke(VERIFY_FUNCTION, {
            body: { reference }
        });

        if (error) throw error;

        if (data?.verified && data?.payment_status === "paid") {
            setCheckoutMessage(`Payment confirmed. Order ${data.order_number} is confirmed.`);
            if (button) button.textContent = "Payment Confirmed";
            sessionStorage.removeItem("chronolux-checkout");
            return true;
        }

        setCheckoutMessage(
            data?.payment_status === "failed"
                ? "Payment was not completed. You can retry the payment."
                : "Payment is still being processed. Please wait a moment and try again.",
            data?.payment_status === "failed"
        );

        if (button) {
            button.disabled = false;
            button.textContent = "Pay Now";
        }
        return true;
    } catch (error) {
        console.error("Payment verification error:", error);
        setCheckoutMessage("We could not verify the payment yet. Please try again.", true);
        if (button) {
            button.disabled = false;
            button.textContent = "Pay Now";
        }
        return true;
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
            // The browser sends only the product slug and customer/shipping data.
            // The server-side Supabase function determines the real price from the
            // watches table, so changing the displayed price in DevTools cannot
            // reduce the amount charged.
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

            sessionStorage.setItem("chronolux-checkout", JSON.stringify({
                order_id: createdOrder.order_id,
                order_number: createdOrder.order_number,
                payment_reference: payment.reference
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
    const returnedFromPayment = await verifyReturnedPayment();
    if (!returnedFromPayment) {
        await loadCheckoutProduct();
    }
});
