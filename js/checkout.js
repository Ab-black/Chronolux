const PAYMENT_FUNCTION = "paystack-initialize";
const SHIPPING_COUNTRIES_FUNCTION = "shipping-countries";
const SHIPPING_QUOTE_FUNCTION = "shipping-quote";
const $ = (id) => document.getElementById(id);

let supportedShippingCountries = [];
let selectedShippingCountry = "";
let currentWatch = null;
let shippingQuote = null;
let shippingQuoteTimer = null;
let shippingQuoteRequest = 0;

function setCheckoutMessage(message, isError = false) {
    const note = document.querySelector(".checkout-note");
    if (!note) return;
    note.textContent = message;
    note.classList.toggle("is-error", isError);
}

function setLoading(isLoading) {
    const button = document.querySelector(".checkout-submit");
    if (!button) return;
    button.disabled = isLoading;
    button.setAttribute("aria-busy", String(isLoading));
    button.textContent = isLoading ? "Preparing Secure Payment…" : "Continue to Secure Payment";
}

function getStoredCheckout() {
    try {
        return JSON.parse(sessionStorage.getItem("chronolux-checkout") || "null");
    } catch {
        return null;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeCountry(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function setCountryError(message) {
    const input = $("shipping-country");
    const error = $("shipping-country-error");
    if (!input || !error) return;
    error.textContent = message || "";
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.classList.toggle("country-invalid", Boolean(message));
}

function setShippingStatus(message = "", type = "") {
    const status = $("shipping-calculation-status");
    if (!status) return;
    status.textContent = message;
    status.className = `shipping-calculation-status ${type}`;
}

function formatMoney(value, currency = "USD") {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value || 0));
    } catch {
        return `${currency} ${Number(value || 0).toFixed(2)}`;
    }
}

function resetShippingQuote(message = "Enter shipping details") {
    shippingQuote = null;
    const shippingBox = $("summary-shipping");
    const totalBox = $("summary-total");
    if (shippingBox) shippingBox.textContent = message;
    if (totalBox && currentWatch) totalBox.textContent = currentWatch.new_price;
}

function showShippingLoading() {
    const shippingBox = $("summary-shipping");
    const totalBox = $("summary-total");
    if (shippingBox) shippingBox.innerHTML = '<span class="shipping-price-loading" aria-hidden="true"></span><span>Calculating…</span>';
    if (totalBox) totalBox.innerHTML = '<span class="shipping-total-loading" aria-hidden="true"></span>';
    setShippingStatus("Calculating delivery price…", "loading");
}

function closeCountryOptions() {
    const options = $("shipping-country-options");
    const input = $("shipping-country");
    const toggle = $("shipping-country-toggle");
    if (!options) return;
    options.hidden = true;
    input?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-expanded", "false");
}

function openCountryOptions() {
    const options = $("shipping-country-options");
    const input = $("shipping-country");
    const toggle = $("shipping-country-toggle");
    if (!options || !supportedShippingCountries.length) return;
    options.hidden = false;
    input?.setAttribute("aria-expanded", "true");
    toggle?.setAttribute("aria-expanded", "true");
    renderCountryOptions(input?.value || "");
}

function renderCountryOptions(query = "") {
    const options = $("shipping-country-options");
    if (!options) return;

    const normalizedQuery = normalizeCountry(query);
    const matches = supportedShippingCountries.filter(country =>
        !normalizedQuery || normalizeCountry(country.name).includes(normalizedQuery)
    );

    if (!matches.length) {
        options.innerHTML = '<div class="country-option-empty">No supported shipping country found.</div>';
        options.hidden = false;
        return;
    }

    options.innerHTML = matches.map(country => `
        <button type="button" class="country-option" role="option" data-country-name="${escapeHtml(country.name)}">
            <span>${escapeHtml(country.name)}</span>
        </button>
    `).join("");
    options.hidden = false;
}

function selectShippingCountry(name) {
    const country = supportedShippingCountries.find(item => normalizeCountry(item.name) === normalizeCountry(name));
    if (!country) return;

    selectedShippingCountry = country.name;
    $("shipping-country").value = country.name;
    setCountryError("");
    closeCountryOptions();
    scheduleShippingQuote();
}

async function loadSupportedShippingCountries() {
    try {
        const { data, error } = await supabaseClient.functions.invoke(SHIPPING_COUNTRIES_FUNCTION, {
            method: "GET"
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        supportedShippingCountries = Array.isArray(data?.countries) ? data.countries : [];

        if (!supportedShippingCountries.length) {
            throw new Error("No supported shipping countries are currently configured.");
        }
    } catch (error) {
        console.error("Shipping countries error:", error);
        setCountryError("Shipping countries are temporarily unavailable. Please try again later.");
    }
}

function validateShippingCountry() {
    const value = $("shipping-country")?.value || "";
    const country = supportedShippingCountries.find(item => normalizeCountry(item.name) === normalizeCountry(value));

    if (!country) {
        selectedShippingCountry = "";
        setCountryError(value.trim()
            ? "Shipping to this country is currently not established. Please select a supported country from the list."
            : "Please select a shipping country.");
        resetShippingQuote("Enter shipping details");
        return false;
    }

    selectedShippingCountry = country.name;
    $("shipping-country").value = country.name;
    setCountryError("");
    return true;
}

function setupCountryPicker() {
    const input = $("shipping-country");
    const toggle = $("shipping-country-toggle");
    const options = $("shipping-country-options");
    if (!input || !toggle || !options) return;

    input.addEventListener("focus", openCountryOptions);
    input.addEventListener("click", openCountryOptions);
    input.addEventListener("input", () => {
        selectedShippingCountry = "";
        shippingQuote = null;
        setCountryError("");
        resetShippingQuote("Enter shipping details");
        openCountryOptions();
        renderCountryOptions(input.value);
    });

    input.addEventListener("blur", () => {
        setTimeout(() => {
            if (!options.matches(":hover")) {
                const valid = validateShippingCountry();
                if (valid) scheduleShippingQuote();
            }
        }, 120);
    });

    toggle.addEventListener("click", () => {
        if (options.hidden) openCountryOptions();
        else closeCountryOptions();
    });

    options.addEventListener("click", event => {
        const option = event.target.closest("[data-country-name]");
        if (option) selectShippingCountry(option.dataset.countryName);
    });

    document.addEventListener("click", event => {
        if (!$("shipping-country-picker")?.contains(event.target)) closeCountryOptions();
    });
}

function scheduleShippingQuote() {
    clearTimeout(shippingQuoteTimer);
    shippingQuoteTimer = setTimeout(calculateShippingQuote, 250);
}

function getShippingInputs() {
    const country = selectedShippingCountry || $("shipping-country")?.value.trim() || "";
    const state = $("shipping-state")?.value.trim() || "";
    return { country, state };
}

async function calculateShippingQuote() {
    if (!currentWatch) return;
    const { country, state } = getShippingInputs();
    if (!country || !validateShippingCountry()) return;

    const requestId = ++shippingQuoteRequest;
    showShippingLoading();

    try {
        const { data, error } = await supabaseClient.functions.invoke(SHIPPING_QUOTE_FUNCTION, {
            body: {
                product_slug: currentWatch.slug,
                country,
                state: state || null,
                currency: "USD"
            }
        });

        if (requestId !== shippingQuoteRequest) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        if (!data?.quote) throw new Error("Shipping to this location is currently not established.");

        shippingQuote = data.quote;
        const shipping = Number(data.quote.calculated_shipping || 0);
        const subtotal = Number(data.quote.subtotal ?? data.quote.watch_price ?? 0);
        const total = Number(data.quote.total_amount ?? subtotal + shipping);
        const currency = data.quote.currency || data.quote.shipping_currency || "USD";

        $("summary-shipping").textContent = formatMoney(shipping, currency);
        $("summary-total").textContent = formatMoney(total, currency);
        setShippingStatus(`Shipping to ${data.quote.shipping_zone || country} calculated.`, "success");
    } catch (error) {
        if (requestId !== shippingQuoteRequest) return;
        console.error("Shipping quote error:", error);
        resetShippingQuote("Unavailable");
        setShippingStatus(error?.message || "Shipping to this location is currently not established.", "error");
    }
}

function setupShippingRecalculation() {
    const state = $("shipping-state");
    state?.addEventListener("input", scheduleShippingQuote);
    state?.addEventListener("change", scheduleShippingQuote);
}

async function loadCheckoutProduct() {
    const slug = new URLSearchParams(window.location.search).get("slug");
    const productBox = $("checkout-product");
    const summaryProduct = $("summary-product");
    const priceBox = $("summary-price");
    const totalBox = $("summary-total");
    const form = $("checkout-form");

    if (!slug) {
        productBox.textContent = "No product was selected. Please return to the collection.";
        setCheckoutMessage("Select a timepiece before continuing.", true);
        return;
    }

    try {
        const { data: watch, error } = await supabaseClient
            .from("watches")
            .select("id, brand, model, slug, new_price, image")
            .eq("slug", slug)
            .single();

        if (error || !watch) throw new Error("This timepiece could not be found.");

        currentWatch = watch;
        productBox.innerHTML = `
            <img src="${escapeHtml(watch.image)}" alt="${escapeHtml(watch.model)}" loading="eager">
            <div>
                <p>${escapeHtml(watch.brand)}</p>
                <h3>${escapeHtml(watch.model)}</h3>
                <strong>${escapeHtml(watch.new_price)}</strong>
            </div>
        `;

        summaryProduct.textContent = `${watch.brand} — ${watch.model}`;
        priceBox.textContent = watch.new_price;
        totalBox.textContent = watch.new_price;
        setCheckoutMessage("Your payment is securely processed through our payment provider.");

        setupShippingRecalculation();

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const countryValid = validateShippingCountry();
            if (!countryValid) {
                $("shipping-country")?.focus();
                return;
            }

            if (!form.checkValidity()) {
                form.reportValidity();
                setCheckoutMessage("Please complete all required details before continuing.", true);
                return;
            }

            if (!shippingQuote) {
                await calculateShippingQuote();
                if (!shippingQuote) {
                    setCheckoutMessage("We could not calculate shipping for this location. Please check your shipping details.", true);
                    return;
                }
            }

            setLoading(true);
            setCheckoutMessage("Creating your secure order and preparing payment…");

            try {
                const { data: order, error: orderError } = await supabaseClient.rpc(
                    "create_chronolux_order",
                    {
                        p_product_slug: slug,
                        p_customer_name: $("customer-name").value.trim(),
                        p_customer_email: $("customer-email").value.trim(),
                        p_customer_phone: $("customer-phone").value.trim(),
                        p_shipping_country: selectedShippingCountry,
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
                        body: { order_id: createdOrder.order_id, callback_url: callbackUrl }
                    }
                );

                if (paymentError) throw paymentError;
                if (!payment?.authorization_url) throw new Error("Payment could not be initialized.");

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
                        country: selectedShippingCountry,
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
                    error?.message || "We could not start secure payment. Please try again.",
                    true
                );
                setLoading(false);
            }
        });
    } catch (error) {
        console.error("Checkout product error:", error);
        productBox.textContent = "Unable to load this timepiece right now.";
        setCheckoutMessage("We could not load this timepiece. Please return to the collection and try again.", true);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const reference = new URLSearchParams(window.location.search).get("reference");

    if (reference) {
        const stored = getStoredCheckout();
        if (stored) {
            stored.payment_reference = reference;
            sessionStorage.setItem("chronolux-checkout", JSON.stringify(stored));
        }
        window.location.replace(`confirmation.html?reference=${encodeURIComponent(reference)}`);
        return;
    }

    setupCountryPicker();
    await loadSupportedShippingCountries();
    await loadCheckoutProduct();
});
