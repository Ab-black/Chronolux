// ==========================================
// CHRONOLUX ADMIN ORDER MANAGEMENT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("orders");
    if (!page) return;

    const body = document.getElementById("orders-table-body");
    const message = document.getElementById("orders-message");
    const search = document.getElementById("orders-search");
    const statusFilter = document.getElementById("orders-status-filter");
    const paymentFilter = document.getElementById("orders-payment-filter");
    const refresh = document.getElementById("refresh-orders");
    let orders = [];

    const esc = value => String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
    const money = (value, currency = "USD") => {
        const amount = Number(value);
        if (!Number.isFinite(amount)) return "—";
        try { return new Intl.NumberFormat("en-US", { style:"currency", currency, minimumFractionDigits:2 }).format(amount); }
        catch { return `${currency} ${amount.toFixed(2)}`; }
    };
    const formatDate = value => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString(undefined, { dateStyle:"medium", timeStyle:"short" });
    };
    const statusLabel = value => String(value ?? "—").replaceAll("_"," ").replace(/\b\w/g, char => char.toUpperCase());

    async function action(actionName, payload = {}) {
        const { data, error } = await supabaseClient.functions.invoke("admin-orders", { body:{ action:actionName, ...payload } });
        if (error) throw new Error(error.message || "Order management request failed.");
        if (data?.error) throw new Error(data.error);
        return data;
    }

    function showMessage(text, type = "") {
        message.textContent = text;
        message.className = `orders-message ${type}`;
    }

    function updateStats() {
        document.getElementById("orders-total-count").textContent = orders.length;
        document.getElementById("orders-paid-count").textContent = orders.filter(order => order.payment_status === "paid").length;
        document.getElementById("orders-pending-count").textContent = orders.filter(order => order.order_status === "pending").length;
        document.getElementById("orders-delivered-count").textContent = orders.filter(order => order.order_status === "delivered").length;
    }

    function filteredOrders() {
        const query = search.value.trim().toLowerCase();
        return orders.filter(order => {
            const itemText = (order.items || []).map(item => `${item.product_brand || ""} ${item.product_model || ""}`).join(" ");
            const haystack = [order.order_number, order.customer_name, order.customer_email, order.customer_phone, order.payment_reference, order.payment_transaction_id, order.product_brand, order.product_model, itemText].join(" ").toLowerCase();
            return (!query || haystack.includes(query)) && (!statusFilter.value || order.order_status === statusFilter.value) && (!paymentFilter.value || order.payment_status === paymentFilter.value);
        });
    }

    function render() {
        const visible = filteredOrders();
        if (!visible.length) {
            body.innerHTML = '<tr><td colspan="11" class="orders-empty">No orders match the current filters.</td></tr>';
            return;
        }

        body.innerHTML = visible.map(order => {
            const items = order.items?.length ? order.items : [{ product_brand:order.product_brand, product_model:order.product_model, quantity:1 }];
            const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const products = items.map(item => `<div class="orders-product"><span class="orders-product-name">${esc([item.product_brand,item.product_model].filter(Boolean).join(" "))}</span><span class="orders-product-qty">×${Number(item.quantity || 0)}</span></div>`).join("");
            const destination = [order.shipping_city, order.shipping_state, order.shipping_country].filter(Boolean).join(", ");
            const reference = order.payment_reference || order.payment_transaction_id || "—";
            return `<tr>
                <td><span class="order-number">${esc(order.order_number)}</span></td>
                <td><span class="customer-name">${esc(order.customer_name)}</span><span class="customer-email">${esc(order.customer_email)}</span></td>
                <td class="products-cell">${products}</td>
                <td>${totalQty}</td>
                <td><span class="orders-total">${money(order.total_amount, order.currency || "USD")}</span></td>
                <td><span class="orders-status-badge ${esc(order.payment_status)}">${esc(statusLabel(order.payment_status))}</span></td>
                <td class="orders-status-cell"><span class="orders-status-badge ${esc(order.order_status)}">${esc(statusLabel(order.order_status))}</span><select data-order-status="${esc(order.id)}" aria-label="Update order status for ${esc(order.order_number)}">${["pending","confirmed","processing","shipped","delivered","cancelled"].map(status => `<option value="${status}" ${status===order.order_status?"selected":""}>${statusLabel(status)}</option>`).join("")}</select></td>
                <td class="orders-destination"><strong>${esc(destination || "—")}</strong><span>${esc(order.shipping_address || "")}</span><span>${esc(order.shipping_postal || "")}</span></td>
                <td class="orders-date">${esc(formatDate(order.created_at))}</td>
                <td class="orders-reference">${esc(reference)}</td>
                <td><button type="button" class="orders-action-btn" data-order-detail="${esc(order.id)}"><i class="fas fa-eye"></i> Details</button></td>
            </tr>`;
        }).join("");
    }

    async function load() {
        body.innerHTML = '<tr><td colspan="11" class="orders-empty">Loading orders...</td></tr>';
        try {
            const data = await action("list");
            orders = data.orders || [];
            updateStats();
            render();
            showMessage(`${orders.length} order${orders.length === 1 ? "" : "s"} loaded.`, "success");
        } catch (error) {
            console.error(error);
            body.innerHTML = '<tr><td colspan="11" class="orders-empty">Orders could not be loaded.</td></tr>';
            showMessage(error.message || "Unable to load orders.", "error");
        }
    }

    async function updateStatus(orderId, nextStatus) {
        const order = orders.find(item => item.id === orderId);
        if (!order || nextStatus === order.order_status) return;
        if (!confirm(`Change ${order.order_number} from ${statusLabel(order.order_status)} to ${statusLabel(nextStatus)}?`)) { render(); return; }
        try {
            await action("update_status", { order_id:orderId, order_status:nextStatus });
            order.order_status = nextStatus;
            updateStats();
            render();
            showMessage(`${order.order_number} is now ${statusLabel(nextStatus)}.`, "success");
        } catch (error) {
            console.error(error);
            render();
            showMessage(error.message || "Unable to update order status.", "error");
        }
    }

    function closeModal() {
        document.getElementById("orders-modal")?.classList.remove("open");
        document.body.classList.remove("orders-modal-open");
    }

    function openModal() {
        let modal = document.getElementById("orders-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "orders-modal";
            modal.className = "orders-modal";
            modal.innerHTML = '<div class="orders-modal-backdrop" data-orders-modal-close></div><div class="orders-modal-dialog" role="dialog" aria-modal="true"><div class="orders-modal-header"><div><span class="orders-eyebrow">ORDER DETAILS</span><h3 id="orders-modal-title"></h3></div><button type="button" class="orders-modal-close" data-orders-modal-close aria-label="Close order details">&times;</button></div><div id="orders-modal-body"></div></div>';
            document.body.appendChild(modal);
            modal.addEventListener("click", event => { if (event.target.closest("[data-orders-modal-close]")) closeModal(); });
        }
        modal.classList.add("open");
        document.body.classList.add("orders-modal-open");
        return modal;
    }

    async function showDetails(orderId) {
        try {
            const data = await action("detail", { order_id:orderId });
            const order = data.order;
            const items = data.items || [];
            const modal = openModal();
            const destination = [order.shipping_address, order.shipping_city, order.shipping_state, order.shipping_country, order.shipping_postal].filter(Boolean).join(", ");
            const itemHtml = items.length ? items.map(item => `<div class="orders-detail-item"><strong>${esc([item.product_brand,item.product_model].filter(Boolean).join(" "))}</strong><span>Qty ${Number(item.quantity || 0)} × ${money(item.unit_price, order.currency || "USD")}</span><strong>${money(item.line_total, order.currency || "USD")}</strong></div>`).join("") : '<p class="orders-empty">No item lines were stored for this order.</p>';
            modal.querySelector("#orders-modal-title").textContent = order.order_number || "Order Details";
            modal.querySelector("#orders-modal-body").innerHTML = `
                <div class="orders-detail-grid">
                    <div class="orders-detail-card"><span>Customer</span><strong>${esc(order.customer_name)}</strong><p>${esc(order.customer_email)}<br>${esc(order.customer_phone)}</p></div>
                    <div class="orders-detail-card"><span>Statuses</span><strong>${esc(statusLabel(order.payment_status))} payment · ${esc(statusLabel(order.order_status))}</strong><p>Payment provider: ${esc(order.payment_provider || "—")}<br>Reference: ${esc(order.payment_reference || "—")}<br>Transaction: ${esc(order.payment_transaction_id || "—")}</p></div>
                    <div class="orders-detail-card full"><span>Shipping Destination</span><strong>${esc(destination || "—")}</strong></div>
                </div>
                <div class="orders-detail-items">${itemHtml}</div>
                <div class="orders-detail-totals">
                    <div class="orders-detail-total"><span>Subtotal</span><strong>${money(order.subtotal, order.currency || "USD")}</strong></div>
                    <div class="orders-detail-total"><span>Shipping</span><strong>${money(order.shipping_price, order.shipping_currency || order.currency || "USD")}</strong></div>
                    <div class="orders-detail-total grand"><span>Total</span><strong>${money(order.total_amount, order.currency || "USD")}</strong></div>
                </div>`;
        } catch (error) {
            console.error(error);
            showMessage(error.message || "Unable to load order details.", "error");
        }
    }

    search.addEventListener("input", render);
    statusFilter.addEventListener("change", render);
    paymentFilter.addEventListener("change", render);
    refresh.addEventListener("click", load);
    body.addEventListener("change", event => { const select = event.target.closest("[data-order-status]"); if (select) updateStatus(select.dataset.orderStatus, select.value); });
    body.addEventListener("click", event => { const button = event.target.closest("[data-order-detail]"); if (button) showDetails(button.dataset.orderDetail); });

    load();
});
