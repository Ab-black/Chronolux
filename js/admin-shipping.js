// ==========================================
// CHRONOLUX ADMIN SHIPPING MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const shippingPage = document.getElementById("shipping");
    if (!shippingPage) return;

    const zonesList = document.getElementById("shipping-zones-list");
    const ratesList = document.getElementById("shipping-rates-list");
    const message = document.getElementById("shipping-message");
    const zoneCount = document.getElementById("shipping-zone-count");
    const rateCount = document.getElementById("shipping-rate-count");
    const previewForm = document.getElementById("shipping-preview-form");

    let zones = [];
    let rates = [];

    const escapeHtml = value => String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const showMessage = (text, type = "") => {
        message.textContent = text;
        message.className = `shipping-message ${type}`;
    };

    const formatMoney = (value, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    };

    async function loadShippingData() {
        zonesList.innerHTML = '<div class="shipping-loading">Loading zones...</div>';
        ratesList.innerHTML = '<div class="shipping-loading">Loading rules...</div>';

        const [zonesResult, ratesResult] = await Promise.all([
            supabaseClient.from("shipping_zones").select("*").order("name"),
            supabaseClient.from("shipping_rates").select("*, shipping_zones(name)").order("active", { ascending: false }).order("id")
        ]);

        if (zonesResult.error || ratesResult.error) {
            console.error(zonesResult.error || ratesResult.error);
            zonesList.innerHTML = '<div class="shipping-empty">Shipping data could not be loaded.</div>';
            ratesList.innerHTML = '<div class="shipping-empty">Shipping data could not be loaded.</div>';
            zoneCount.textContent = "—";
            rateCount.textContent = "—";
            showMessage("Shipping management requires an authorized Supabase admin session.", "error");
            return;
        }

        zones = zonesResult.data || [];
        rates = ratesResult.data || [];
        renderZones();
        renderRates();
    }

    function renderZones() {
        const activeZones = zones.filter(zone => zone.active);
        zoneCount.textContent = activeZones.length;

        if (!zones.length) {
            zonesList.innerHTML = '<div class="shipping-empty">No shipping zones found.</div>';
            return;
        }

        zonesList.innerHTML = zones.map(zone => `
            <div class="shipping-zone-row">
                <div>
                    <strong>${escapeHtml(zone.name)}</strong>
                    <span>${escapeHtml(zone.description || "No description")}</span>
                </div>
                <div class="shipping-zone-actions">
                    <span class="shipping-status ${zone.active ? "active" : "inactive"}">${zone.active ? "Active" : "Inactive"}</span>
                    <button class="small-action" data-zone-edit="${zone.id}" type="button" aria-label="Edit ${escapeHtml(zone.name)}">Edit</button>
                    <button class="small-action danger" data-zone-toggle="${zone.id}" type="button">${zone.active ? "Disable" : "Enable"}</button>
                </div>
            </div>
        `).join("");
    }

    function renderRates() {
        const activeRates = rates.filter(rate => rate.active);
        rateCount.textContent = activeRates.length;

        if (!rates.length) {
            ratesList.innerHTML = '<div class="shipping-empty">No shipping rules found.</div>';
            return;
        }

        ratesList.innerHTML = rates.map(rate => {
            const location = [rate.country, rate.state].filter(Boolean).join(" · ") || "Zone default";
            const zoneName = rate.shipping_zones?.name || "Unknown zone";
            const scope = rate.state ? "State rule" : rate.country ? "Country rule" : "Zone rule";

            return `
                <article class="shipping-rate-card ${rate.active ? "" : "inactive-rule"}">
                    <div class="shipping-rate-top">
                        <div>
                            <span class="shipping-rule-type">${escapeHtml(scope)}</span>
                            <h4>${escapeHtml(location)}</h4>
                            <p>${escapeHtml(zoneName)}</p>
                        </div>
                        <span class="shipping-status ${rate.active ? "active" : "inactive"}">${rate.active ? "Active" : "Inactive"}</span>
                    </div>
                    <div class="shipping-rate-values">
                        <div><span>Base</span><strong>${formatMoney(rate.base_fee, rate.currency)}</strong></div>
                        <div><span>Value Rate</span><strong>${Number(rate.value_rate).toFixed(2)}%</strong></div>
                        <div><span>Minimum</span><strong>${rate.minimum_fee == null ? "—" : formatMoney(rate.minimum_fee, rate.currency)}</strong></div>
                        <div><span>Maximum</span><strong>${rate.maximum_fee == null ? "—" : formatMoney(rate.maximum_fee, rate.currency)}</strong></div>
                    </div>
                    <div class="shipping-rate-actions">
                        <button class="small-action" data-rate-edit="${rate.id}" type="button">Edit</button>
                        <button class="small-action danger" data-rate-toggle="${rate.id}" type="button">${rate.active ? "Disable" : "Enable"}</button>
                        <button class="small-action danger" data-rate-delete="${rate.id}" type="button">Delete</button>
                    </div>
                </article>
            `;
        }).join("");
    }

    async function addZone() {
        const name = prompt("Shipping zone name:");
        if (!name?.trim()) return;
        const description = prompt("Description (optional):", "");

        const { error } = await supabaseClient.from("shipping_zones").insert({
            name: name.trim(),
            description: description?.trim() || null,
            active: true
        });

        if (error) {
            console.error(error);
            showMessage("Unable to create the shipping zone.", "error");
            return;
        }

        showMessage("Shipping zone created.", "success");
        loadShippingData();
    }

    async function editZone(id) {
        const zone = zones.find(item => String(item.id) === String(id));
        if (!zone) return;

        const name = prompt("Shipping zone name:", zone.name);
        if (!name?.trim()) return;
        const description = prompt("Description:", zone.description || "");

        const { error } = await supabaseClient.from("shipping_zones").update({
            name: name.trim(),
            description: description?.trim() || null
        }).eq("id", id);

        if (error) {
            console.error(error);
            showMessage("Unable to update the shipping zone.", "error");
            return;
        }

        showMessage("Shipping zone updated.", "success");
        loadShippingData();
    }

    async function toggleZone(id) {
        const zone = zones.find(item => String(item.id) === String(id));
        if (!zone) return;

        const action = zone.active ? "disable" : "enable";
        if (!confirm(`Are you sure you want to ${action} ${zone.name}?`)) return;

        const { error } = await supabaseClient.from("shipping_zones").update({ active: !zone.active }).eq("id", id);
        if (error) {
            console.error(error);
            showMessage("Unable to change the zone status.", "error");
            return;
        }

        showMessage(`Shipping zone ${action}d.`, "success");
        loadShippingData();
    }

    async function addRate() {
        if (!zones.length) {
            showMessage("Create a shipping zone before adding a shipping rule.", "error");
            return;
        }

        const zoneOptions = zones.map(zone => `${zone.id}: ${zone.name}`).join("\n");
        const zoneId = prompt(`Enter the Zone ID for this rule:\n\n${zoneOptions}`);
        if (!zoneId) return;
        const zone = zones.find(item => String(item.id) === String(zoneId));
        if (!zone) {
            showMessage("Invalid shipping zone ID.", "error");
            return;
        }

        const country = prompt("Country (leave blank for zone rule):", "");
        const state = country?.trim() ? prompt("State / Region (leave blank for country rule):", "") : "";
        const baseFee = prompt("Base shipping fee:", "0");
        const valueRate = prompt("Value rate (% of watch price):", "0");
        const minimumFee = prompt("Minimum fee (leave blank for none):", "");
        const maximumFee = prompt("Maximum fee (leave blank for none):", "");
        const currency = prompt("Currency (USD, NGN, EUR, GBP):", "USD");

        const payload = {
            zone_id: Number(zoneId),
            country: country?.trim() || null,
            state: state?.trim() || null,
            base_fee: Number(baseFee),
            value_rate: Number(valueRate),
            minimum_fee: minimumFee?.trim() ? Number(minimumFee) : null,
            maximum_fee: maximumFee?.trim() ? Number(maximumFee) : null,
            currency: currency?.trim().toUpperCase() || "USD",
            active: true
        };

        if ([payload.base_fee, payload.value_rate].some(value => !Number.isFinite(value) || value < 0)) {
            showMessage("Base fee and value rate must be valid non-negative numbers.", "error");
            return;
        }

        const { error } = await supabaseClient.from("shipping_rates").insert(payload);
        if (error) {
            console.error(error);
            showMessage(error.message || "Unable to create the shipping rule.", "error");
            return;
        }

        showMessage("Shipping rule created.", "success");
        loadShippingData();
    }

    async function editRate(id) {
        const rate = rates.find(item => String(item.id) === String(id));
        if (!rate) return;

        const baseFee = prompt("Base shipping fee:", rate.base_fee);
        const valueRate = prompt("Value rate (% of watch price):", rate.value_rate);
        const minimumFee = prompt("Minimum fee (blank for none):", rate.minimum_fee ?? "");
        const maximumFee = prompt("Maximum fee (blank for none):", rate.maximum_fee ?? "");

        const payload = {
            base_fee: Number(baseFee),
            value_rate: Number(valueRate),
            minimum_fee: minimumFee?.trim() ? Number(minimumFee) : null,
            maximum_fee: maximumFee?.trim() ? Number(maximumFee) : null
        };

        if (!Number.isFinite(payload.base_fee) || payload.base_fee < 0 || !Number.isFinite(payload.value_rate) || payload.value_rate < 0) {
            showMessage("Invalid shipping values.", "error");
            return;
        }

        const { error } = await supabaseClient.from("shipping_rates").update(payload).eq("id", id);
        if (error) {
            console.error(error);
            showMessage(error.message || "Unable to update the shipping rule.", "error");
            return;
        }

        showMessage("Shipping rule updated.", "success");
        loadShippingData();
    }

    async function toggleRate(id) {
        const rate = rates.find(item => String(item.id) === String(id));
        if (!rate) return;
        const action = rate.active ? "disable" : "enable";
        if (!confirm(`Are you sure you want to ${action} this shipping rule?`)) return;

        const { error } = await supabaseClient.from("shipping_rates").update({ active: !rate.active }).eq("id", id);
        if (error) {
            console.error(error);
            showMessage("Unable to change the shipping rule status.", "error");
            return;
        }

        showMessage(`Shipping rule ${action}d.`, "success");
        loadShippingData();
    }

    async function deleteRate(id) {
        if (!confirm("Permanently delete this shipping rule? This cannot be undone.")) return;

        const { error } = await supabaseClient.from("shipping_rates").delete().eq("id", id);
        if (error) {
            console.error(error);
            showMessage("Unable to delete the shipping rule.", "error");
            return;
        }

        showMessage("Shipping rule deleted.", "success");
        loadShippingData();
    }

    document.getElementById("add-shipping-zone")?.addEventListener("click", addZone);
    document.getElementById("add-shipping-rate")?.addEventListener("click", addRate);

    zonesList.addEventListener("click", event => {
        const edit = event.target.closest("[data-zone-edit]");
        const toggle = event.target.closest("[data-zone-toggle]");
        if (edit) editZone(edit.dataset.zoneEdit);
        if (toggle) toggleZone(toggle.dataset.zoneToggle);
    });

    ratesList.addEventListener("click", event => {
        const edit = event.target.closest("[data-rate-edit]");
        const toggle = event.target.closest("[data-rate-toggle]");
        const remove = event.target.closest("[data-rate-delete]");
        if (edit) editRate(edit.dataset.rateEdit);
        if (toggle) toggleRate(toggle.dataset.rateToggle);
        if (remove) deleteRate(remove.dataset.rateDelete);
    });

    previewForm?.addEventListener("submit", async event => {
        event.preventDefault();
        const price = Number(document.getElementById("shipping-preview-price").value);
        const country = document.getElementById("shipping-preview-country").value.trim();
        const state = document.getElementById("shipping-preview-state").value.trim() || null;
        const currency = document.getElementById("shipping-preview-currency").value;
        const result = document.getElementById("shipping-preview-result");

        result.innerHTML = "<span>Calculating...</span>";

        const { data, error } = await supabaseClient.rpc("get_chronolux_shipping_quote", {
            p_watch_price: price,
            p_country: country,
            p_state: state,
            p_currency: currency
        });

        if (error || !data?.length) {
            console.error(error);
            result.innerHTML = "<strong>Unable to calculate a quote.</strong><span>Make sure an active matching rule exists.</span>";
            return;
        }

        const quote = data[0];
        result.innerHTML = `
            <div><span>Matched Rule</span><strong>${escapeHtml(quote.match_level)}</strong></div>
            <div><span>Zone</span><strong>${escapeHtml(quote.shipping_zone)}</strong></div>
            <div><span>Base Fee</span><strong>${formatMoney(quote.base_fee, quote.shipping_currency)}</strong></div>
            <div><span>Value Component</span><strong>${formatMoney(quote.value_component, quote.shipping_currency)}</strong></div>
            <div><span>Shipping</span><strong>${formatMoney(quote.calculated_shipping, quote.shipping_currency)}</strong></div>
        `;
    });

    loadShippingData();
});
