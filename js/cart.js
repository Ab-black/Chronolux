// ======================================
// CHRONOLUX CART — LOCAL STORAGE FOUNDATION
// ======================================
//
// This file is intentionally independent from checkout.js.
// It provides the cart storage layer only.
// Product-card buttons and checkout integration are added
// in later cart phases.

const CHRONOLUX_CART_KEY = "chronolux-cart";
const CHRONOLUX_DEFAULT_MAX_QUANTITY = null; // No inventory limit exists in the current watches schema.

function updateCartCountUI() {
    document.querySelectorAll(".cart-count").forEach(element => {
        element.textContent = getCartItemCount();
    });
}

function getCart() {
    try {
        const storedCart = localStorage.getItem(CHRONOLUX_CART_KEY);
        if (!storedCart) return [];

        const parsedCart = JSON.parse(storedCart);
        return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
        console.error("Unable to read ChronoLux cart:", error);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CHRONOLUX_CART_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error("Unable to save ChronoLux cart:", error);
        return false;
    }
}

function getCartQuantityLimit(item) {
    if (item && Number.isInteger(item.maxQuantity) && item.maxQuantity > 0) {
        return item.maxQuantity;
    }
    return CHRONOLUX_DEFAULT_MAX_QUANTITY;
}

function normalizeCartItem(item) {
    if (!item || item.id === undefined || item.id === null) return null;

    const quantity = Number.parseInt(item.quantity, 10);
    const maxQuantity = getCartQuantityLimit(item);
    const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

    return {
        id: item.id,
        slug: String(item.slug || ""),
        brand: String(item.brand || ""),
        model: String(item.model || ""),
        price: String(item.price || ""),
        image: String(item.image || ""),
        quantity: maxQuantity ? Math.min(safeQuantity, maxQuantity) : safeQuantity
    };
}

function addToCart(item) {
    const normalizedItem = normalizeCartItem(item);
    if (!normalizedItem) {
        return { saved: false, alreadyInCart: false };
    }

    const cart = getCart();
    const existingItem = cart.find(cartItem => String(cartItem.id) === String(normalizedItem.id));

    // Phase 14 intentionally treats the cart as a selection:
    // clicking ADD TO CART again does not silently increase quantity.
    if (existingItem) {
        return { saved: true, alreadyInCart: true };
    }

    cart.push(normalizedItem);

    const saved = saveCart(cart);

    if (saved) {
        document.dispatchEvent(new CustomEvent("chronolux:cart-updated", {
            detail: { count: getCartItemCount() }
        }));
    }

    return { saved, alreadyInCart: false };
}

function showCartFeedback(button, message, stateClass) {
    if (!button) return;

    const originalText = button.dataset.originalText || button.textContent.trim();
    button.dataset.originalText = originalText;
    button.textContent = message;
    button.classList.remove("cart-added", "cart-already-added");
    if (stateClass) button.classList.add(stateClass);

    clearTimeout(button._cartFeedbackTimer);
    button._cartFeedbackTimer = setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("cart-added", "cart-already-added");
    }, 1800);
}

function removeFromCart(productId) {
    const cart = getCart().filter(item => String(item.id) !== String(productId));
    const saved = saveCart(cart);

    if (saved) {
        document.dispatchEvent(new CustomEvent("chronolux:cart-updated", {
            detail: { count: getCartItemCount() }
        }));
    }

    return saved;
}

function updateCartQuantity(productId, quantity) {
    const nextQuantity = Number.parseInt(quantity, 10);

    if (!Number.isFinite(nextQuantity) || nextQuantity < 1) {
        return removeFromCart(productId);
    }

    const cart = getCart();
    const item = cart.find(cartItem => String(cartItem.id) === String(productId));

    if (!item) return false;

    const maxQuantity = getCartQuantityLimit(item);
    item.quantity = maxQuantity ? Math.min(nextQuantity, maxQuantity) : nextQuantity;
    const saved = saveCart(cart);

    if (saved) {
        document.dispatchEvent(new CustomEvent("chronolux:cart-updated", {
            detail: { count: getCartItemCount() }
        }));
    }

    return saved;
}

function clearCart() {
    try {
        localStorage.removeItem(CHRONOLUX_CART_KEY);
        document.dispatchEvent(new CustomEvent("chronolux:cart-updated", {
            detail: { count: 0 }
        }));
        return true;
    } catch (error) {
        console.error("Unable to clear ChronoLux cart:", error);
        return false;
    }
}

function getCartItemCount() {
    return getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
}


// Product-card cart interaction is handled centrally so dynamically
// rendered cards and pages using the same cart logic remain consistent.
document.addEventListener("DOMContentLoaded", updateCartCountUI);

document.addEventListener("chronolux:cart-updated", updateCartCountUI);

document.addEventListener("click", (event) => {
    const button = event.target.closest(".add-to-cart-btn");
    if (!button) return;

    const result = addToCart({
        id: button.dataset.watchId,
        slug: button.dataset.watchSlug,
        brand: button.dataset.watchBrand,
        model: button.dataset.watchModel,
        price: button.dataset.watchPrice,
        image: button.dataset.watchImage,
        quantity: 1
    });

    if (!result.saved) return;

    if (result.alreadyInCart) {
        showCartFeedback(button, "ALREADY IN SELECTION", "cart-already-added");
        return;
    }

    showCartFeedback(button, "ADDED TO SELECTION", "cart-added");
});


function getCartItemSubtotal(item) {
    if (!item) return 0;
    const price = Number(String(item.price || "").replace(/[^0-9.-]+/g, ""));
    const quantity = Number.parseInt(item.quantity, 10);
    return Number.isFinite(price) && Number.isFinite(quantity) && quantity > 0 ? price * quantity : 0;
}

function getCartSubtotal() {
    return getCart().reduce((total, item) => total + getCartItemSubtotal(item), 0);
}
