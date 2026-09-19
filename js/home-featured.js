// ======================================
// LOAD FEATURED WATCHES
// ======================================

document.addEventListener("DOMContentLoaded", loadFeaturedWatches);

async function loadFeaturedWatches() {
    const grid = document.getElementById("watch-grid");
    if (!grid) return;

    const { data: watches, error } = await supabaseClient
        .from("watches")
        .select("*")
        .eq("featured", true)
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    grid.innerHTML = "";

    watches.forEach(watch => {
        grid.innerHTML += `
        <div class="watch-card">
            <div class="watch-image">
                <a href="product.html?slug=${watch.slug}">
                    <img src="${watch.image}" alt="${watch.model}">
                </a>
            </div>
            <div class="watch-details">
                <span>${watch.brand}</span>
                <h3><a href="product.html?slug=${watch.slug}">${watch.model}</a></h3>
                <h4 class="watch-price">
                    <span class="old-price">${watch.old_price}</span>
                    <span class="new-price">${watch.new_price}</span>
                </h4>
                <div class="watch-actions">
                    <button type="button" class="watch-btn add-to-cart-btn" data-watch-id="${watch.id}" data-watch-slug="${watch.slug}" data-watch-brand="${watch.brand}" data-watch-model="${watch.model}" data-watch-price="${watch.new_price}" data-watch-image="${watch.image}">ADD TO CART</button>
                    <a href="checkout.html?slug=${encodeURIComponent(watch.slug)}" class="watch-btn">BUY NOW</a>
                </div>
            </div>
        </div>`;
    });
    setupCartButtons();
}


function setupCartButtons() {
    document.querySelectorAll(".add-to-cart-btn").forEach(button => {
        button.addEventListener("click", () => {
            const added = addToCart({
                id: button.dataset.watchId,
                slug: button.dataset.watchSlug,
                brand: button.dataset.watchBrand,
                model: button.dataset.watchModel,
                price: button.dataset.watchPrice,
                image: button.dataset.watchImage,
                quantity: 1
            });
            if (!added) return;
            const originalText = button.textContent.trim();
            button.textContent = "ADDED TO CART";
            button.classList.add("cart-added");
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove("cart-added");
            }, 1600);
        });
    });
}

