const VERIFY_FUNCTION = "paystack-verify";
const $ = (id) => document.getElementById(id);

function getCheckoutSession() {
    try {
        return JSON.parse(sessionStorage.getItem("chronolux-checkout") || "null");
    } catch {
        return null;
    }
}

function showFailure(message, retryHref = "collection.html") {
    $("confirmation-loading").hidden = true;
    $("confirmation-success").hidden = true;
    $("confirmation-failure").hidden = false;
    $("confirmation-error-message").textContent = message;
    $("confirmation-retry").href = retryHref;
}

function formatMoney(value, currency = "USD") {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return value || "—";
    try {
        return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    } catch {
        return `${currency || "USD"} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderConfirmation(order, stored, verification) {
    const currency = order?.currency || "USD";
    const product = {
        brand: order?.product_brand || stored?.product?.brand || "ChronoLux",
        model: order?.product_model || stored?.product?.model || "Timepiece",
        price: order?.unit_price ?? order?.subtotal ?? stored?.product?.price,
        image: stored?.product?.image || ""
    };
    const shipping = Number(order?.shipping_price);
    const total = Number(order?.total_amount ?? verification?.paid_amount);

    $("confirmation-order-number").textContent = order?.order_number || stored?.order_number || "—";
    $("confirmation-payment").textContent = "Confirmed";
    $("confirmation-name").textContent = order?.customer_name || stored?.customer?.name || "—";
    $("confirmation-email").textContent = order?.customer_email || stored?.customer?.email || "—";
    $("confirmation-phone").textContent = order?.customer_phone || stored?.customer?.phone || "—";
    $("confirmation-address").textContent = order?.shipping_address || stored?.shipping?.address || "—";
    $("confirmation-city-state").textContent = [order?.shipping_city || stored?.shipping?.city, order?.shipping_state || stored?.shipping?.state].filter(Boolean).join(", ") || "—";
    $("confirmation-country").textContent = order?.shipping_country || stored?.shipping?.country || "—";
    $("confirmation-postal").textContent = order?.shipping_postal || stored?.shipping?.postal || "—";
    $("confirmation-email-note").textContent = order?.customer_email || stored?.customer?.email || "your email address";
    $("confirmation-watch-total").textContent = formatMoney(product.price, currency);
    $("confirmation-shipping").textContent = Number.isFinite(shipping) ? formatMoney(shipping, order?.shipping_currency || currency) : "—";
    $("confirmation-total").textContent = Number.isFinite(total) ? formatMoney(total, currency) : "—";

    const productBox = $("confirmation-product");
    productBox.innerHTML = `
        ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.model)}" loading="eager">` : ""}
        <div><p>${escapeHtml(product.brand)}</p><h3>${escapeHtml(product.model)}</h3><strong>${formatMoney(product.price, currency)}</strong></div>
    `;

    $("confirmation-loading").hidden = true;
    $("confirmation-failure").hidden = true;
    $("confirmation-success").hidden = false;
}

async function confirmOrder() {
    const reference = new URLSearchParams(window.location.search).get("reference");
    const stored = getCheckoutSession();

    if (!reference) {
        showFailure("No payment reference was provided. We cannot confirm this order without a valid payment reference.");
        return;
    }

    try {
        const { data, error } = await supabaseClient.functions.invoke(VERIFY_FUNCTION, { body: { reference } });
        if (error) throw error;

        if (!data?.verified || data?.payment_status !== "paid") {
            showFailure(data?.payment_status === "failed"
                ? "The payment was not completed successfully. No payment confirmation was issued for this order."
                : "The payment has not been confirmed yet. Please wait a moment and try again.");
            return;
        }

        if (!data?.order) {
            showFailure("Payment was verified, but the order record could not be loaded securely. Please contact ChronoLux Concierge.");
            return;
        }

        renderConfirmation(data.order, stored, data);
        sessionStorage.removeItem("chronolux-checkout");
    } catch (error) {
        console.error("Confirmation verification error:", error);
        showFailure("We could not securely verify this payment right now. Please try again shortly.");
    }
}

document.addEventListener("DOMContentLoaded", confirmOrder);
