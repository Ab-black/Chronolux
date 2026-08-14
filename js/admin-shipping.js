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

    const formatMoney = (value, currency = "USD") => new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2
    }).format(Number(value || 0));

    async function shippingAction(action, payload = {}) {
        const { data, error } = await supabaseClient.functions.invoke("admin-shipping", {
            body: { action, ...payload }
        });

        if (error) {
            console.error(`admin-shipping ${action}:`, error);
            throw new Error(error.message || "Shipping management request failed.");
        }

        if (data?.error) throw new Error(data.error);
        return data;
    }

    async function loadShippingData() {
        zonesList.innerHTML = '<div class="shipping-loading">Loading zones...</div>';
        ratesList.innerHTML = '<div class="shipping-loading">Loading rules...</div>';

        try {
            const data = await shippingAction("list");
            zones = data.zones || [];
            rates = data.rates || [];
            renderZones();
            renderRates();
            showMessage("Shipping configuration loaded.", "success");
        } catch (error) {
            console.error(error);
            zonesList.innerHTML = '<div class="shipping-empty">Shipping data could not be loaded.</div>';
            ratesList.innerHTML = '<div class="shipping-empty">Shipping data could not be loaded.</div>';
            zoneCount.textContent = "—";
            rateCount.textContent = "—";
            showMessage(error.message || "Shipping management requires an authorized admin session.", "error");
        }
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
                    <button class="small-action" data-zone-edit="${zone.id}" type="button">Edit</button>
                    <button class="small-action danger" data-zone-toggle="${zone.id}" type="button">${zone.active ? "Disable" : "Enable"}</button>
                    <button class="small-action danger" data-zone-delete="${zone.id}" type="button">Delete</button>
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

        const zoneMap = new Map(zones.map(zone => [String(zone.id), zone.name]));
        const countriesByZone = new Map();

        rates.forEach(rate => {
            if (!rate.country || rate.state) return;
            const zoneKey = String(rate.zone_id);
            if (!countriesByZone.has(zoneKey)) countriesByZone.set(zoneKey, new Set());
            countriesByZone.get(zoneKey).add(rate.country);
        });

        ratesList.innerHTML = rates.map(rate => {
            const zoneName = zoneMap.get(String(rate.zone_id)) || "Unknown zone";
            const scope = rate.state ? "State rule" : rate.country ? "Country rule" : "Zone rule";
            const isInternational = zoneName.toLowerCase() === "international";

            let heading = zoneName;
            let coverage = "";

            if (rate.state) {
                heading = rate.state;
                coverage = rate.country || zoneName;
            } else if (rate.country) {
                heading = rate.country;
                coverage = zoneName;
            } else if (isInternational) {
                heading = "International";
                coverage = "This rule is used when a supported shipping location does not have a more specific regional or country shipping rule.";
            } else {
                heading = zoneName;
                const countries = Array.from(countriesByZone.get(String(rate.zone_id)) || []);
                coverage = countries.length
                    ? countries.join(" • ")
                    : "No countries are currently assigned to this zone.";
            }

            return `
                <article class="shipping-rate-card ${rate.active ? "" : "inactive-rule"}">
                    <div class="shipping-rate-top">
                        <div>
                            <span class="shipping-rule-type">${escapeHtml(scope)}</span>
                            <h4>${escapeHtml(heading)}</h4>
                            <p>${escapeHtml(coverage)}</p>
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

        try {
            await shippingAction("create_zone", {
                name: name.trim(),
                description: description?.trim() || null,
                active: true
            });
            showMessage("Shipping zone created.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to create the shipping zone.", "error");
        }
    }

    async function editZone(id) {
        const zone = zones.find(item => String(item.id) === String(id));
        if (!zone) return;

        const name = prompt("Shipping zone name:", zone.name);
        if (!name?.trim()) return;
        const description = prompt("Description:", zone.description || "");

        try {
            await shippingAction("update_zone", {
                id: Number(id),
                name: name.trim(),
                description: description?.trim() || null,
                active: zone.active
            });
            showMessage("Shipping zone updated.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to update the shipping zone.", "error");
        }
    }

    async function toggleZone(id) {
        const zone = zones.find(item => String(item.id) === String(id));
        if (!zone) return;

        const action = zone.active ? "disable" : "enable";
        if (!confirm(`Are you sure you want to ${action} ${zone.name}?`)) return;

        try {
            await shippingAction("toggle_zone", { id: Number(id) });
            showMessage(`Shipping zone ${action}d.`, "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to change the zone status.", "error");
        }
    }

    async function deleteZone(id) {
        const zone = zones.find(item => String(item.id) === String(id));
        if (!zone) return;
        if (!confirm(`Permanently delete the ${zone.name} shipping zone? This cannot be undone.`)) return;

        try {
            await shippingAction("delete_zone", { id: Number(id) });
            showMessage("Shipping zone deleted.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to delete the shipping zone. It may still contain shipping rules.", "error");
        }
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
        if (payload.minimum_fee !== null && (!Number.isFinite(payload.minimum_fee) || payload.minimum_fee < 0)) {
            showMessage("Minimum fee must be a valid non-negative number.", "error");
            return;
        }
        if (payload.maximum_fee !== null && (!Number.isFinite(payload.maximum_fee) || payload.maximum_fee < 0)) {
            showMessage("Maximum fee must be a valid non-negative number.", "error");
            return;
        }
        if (payload.minimum_fee !== null && payload.maximum_fee !== null && payload.maximum_fee < payload.minimum_fee) {
            showMessage("Maximum fee cannot be lower than minimum fee.", "error");
            return;
        }

        try {
            await shippingAction("create_rate", payload);
            showMessage("Shipping rule created.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to create the shipping rule.", "error");
        }
    }

    async function editRate(id) {
        const rate = rates.find(item => String(item.id) === String(id));
        if (!rate) return;

        const baseFee = prompt("Base shipping fee:", rate.base_fee);
        const valueRate = prompt("Value rate (% of watch price):", rate.value_rate);
        const minimumFee = prompt("Minimum fee (blank for none):", rate.minimum_fee ?? "");
        const maximumFee = prompt("Maximum fee (blank for none):", rate.maximum_fee ?? "");

        const payload = {
            id: Number(id),
            zone_id: Number(rate.zone_id),
            country: rate.country || null,
            state: rate.state || null,
            base_fee: Number(baseFee),
            value_rate: Number(valueRate),
            minimum_fee: minimumFee?.trim() ? Number(minimumFee) : null,
            maximum_fee: maximumFee?.trim() ? Number(maximumFee) : null,
            currency: rate.currency,
            active: rate.active
        };

        if (!Number.isFinite(payload.base_fee) || payload.base_fee < 0 || !Number.isFinite(payload.value_rate) || payload.value_rate < 0) {
            showMessage("Invalid shipping values.", "error");
            return;
        }
        if (payload.minimum_fee !== null && (!Number.isFinite(payload.minimum_fee) || payload.minimum_fee < 0)) {
            showMessage("Invalid minimum fee.", "error");
            return;
        }
        if (payload.maximum_fee !== null && (!Number.isFinite(payload.maximum_fee) || payload.maximum_fee < 0)) {
            showMessage("Invalid maximum fee.", "error");
            return;
        }
        if (payload.minimum_fee !== null && payload.maximum_fee !== null && payload.maximum_fee < payload.minimum_fee) {
            showMessage("Maximum fee cannot be lower than minimum fee.", "error");
            return;
        }

        try {
            await shippingAction("update_rate", payload);
            showMessage("Shipping rule updated.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to update the shipping rule.", "error");
        }
    }

    async function toggleRate(id) {
        const rate = rates.find(item => String(item.id) === String(id));
        if (!rate) return;
        const action = rate.active ? "disable" : "enable";
        if (!confirm(`Are you sure you want to ${action} this shipping rule?`)) return;

        try {
            await shippingAction("toggle_rate", { id: Number(id) });
            showMessage(`Shipping rule ${action}d.`, "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to change the shipping rule status.", "error");
        }
    }

    async function deleteRate(id) {
        if (!confirm("Permanently delete this shipping rule? This cannot be undone.")) return;

        try {
            await shippingAction("delete_rate", { id: Number(id) });
            showMessage("Shipping rule deleted.", "success");
            await loadShippingData();
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to delete the shipping rule.", "error");
        }
    }

    document.getElementById("add-shipping-zone")?.addEventListener("click", addZone);
    document.getElementById("add-shipping-rate")?.addEventListener("click", addRate);

    zonesList.addEventListener("click", event => {
        const edit = event.target.closest("[data-zone-edit]");
        const toggle = event.target.closest("[data-zone-toggle]");
        const remove = event.target.closest("[data-zone-delete]");
        if (edit) editZone(edit.dataset.zoneEdit);
        if (toggle) toggleZone(toggle.dataset.zoneToggle);
        if (remove) deleteZone(remove.dataset.zoneDelete);
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

        if (!Number.isFinite(price) || price < 0 || !country) {
            result.innerHTML = "<strong>Enter a valid watch price and country.</strong>";
            return;
        }

        try {
            const data = await shippingAction("quote", {
                watch_price: price,
                country,
                state,
                currency
            });

            const quote = data.quote;
            if (!quote) throw new Error("No matching shipping rule was found.");

            result.innerHTML = `
                <div><span>Matched Rule</span><strong>${escapeHtml(quote.match_level)}</strong></div>
                <div><span>Zone</span><strong>${escapeHtml(quote.shipping_zone)}</strong></div>
                <div><span>Base Fee</span><strong>${formatMoney(quote.base_fee, quote.shipping_currency)}</strong></div>
                <div><span>Value Component</span><strong>${formatMoney(quote.value_component, quote.shipping_currency)}</strong></div>
                <div><span>Shipping</span><strong>${formatMoney(quote.calculated_shipping, quote.shipping_currency)}</strong></div>
            `;
        } catch (error) {
            console.error(error);
            result.innerHTML = `<strong>Unable to calculate a quote.</strong><span>${escapeHtml(error.message || "Make sure an active matching rule exists.")}</span>`;
        }
    });

    loadShippingData();
});
