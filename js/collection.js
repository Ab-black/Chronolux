// ==========================================
// CHRONOLUX COLLECTION
// ==========================================

let allWatches = [];
let selectedCollection = "";

document.addEventListener("DOMContentLoaded", loadCollection);

async function loadCollection() {
    const grid = document.getElementById("watch-grid");
    if (!grid) return;

    grid.innerHTML = "<p>Loading watches...</p>";

    const params = new URLSearchParams(window.location.search);
    selectedCollection = (params.get("collection") || "").trim().toLowerCase();

    let query = supabaseClient
        .from("watches")
        .select("*")
        .order("id", { ascending: false });

    if (selectedCollection) query = query.eq("collection", selectedCollection);

    const { data: watches, error } = await query;

    if (error) {
        console.error(error);
        grid.innerHTML = "<p>Unable to load watches.</p>";
        return;
    }

    allWatches = watches || [];
    populateBrandFilter(allWatches);
    renderWatches(allWatches);

    const searchInput = document.getElementById("watch-search");
    if (searchInput) searchInput.addEventListener("input", filterWatches);

    const brandFilter = document.getElementById("brand-filter");
    if (brandFilter) brandFilter.addEventListener("change", filterWatches);

    const sortFilter = document.getElementById("sort-filter");
    if (sortFilter) sortFilter.addEventListener("change", filterWatches);
}

function renderWatches(watches) {
    const grid = document.getElementById("watch-grid");

    if (watches.length === 0) {
        grid.innerHTML = selectedCollection
            ? "<p>No watches found in this collection.</p>"
            : "<p>No watches found.</p>";
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
                <a href="checkout.html?slug=${encodeURIComponent(watch.slug)}" class="watch-btn">
                    BUY NOW
                </a>
            </div>
        </div>`;
    });
}

function populateBrandFilter(watches) {
    const brandFilter = document.getElementById("brand-filter");
    if (!brandFilter) return;

    brandFilter.innerHTML = `<option value="all">All Brands</option>`;
    const brands = [...new Set(watches.map(w => w.brand))].sort();

    brands.forEach(brand => {
        brandFilter.innerHTML += `<option value="${brand}">${brand}</option>`;
    });
}

function filterWatches() {
    const searchInput = document.getElementById("watch-search");
    const brandFilter = document.getElementById("brand-filter");
    const sortFilter = document.getElementById("sort-filter");

    const search = (searchInput?.value || "").toLowerCase();
    const brand = brandFilter?.value || "all";
    const sort = sortFilter?.value || "default";

    let filtered = allWatches.filter(watch => {
        const watchBrand = String(watch.brand || "").toLowerCase();
        const watchModel = String(watch.model || "").toLowerCase();
        return (watchBrand.includes(search) || watchModel.includes(search)) &&
               (brand === "all" || watch.brand === brand);
    });

    switch (sort) {
        case "oldest": filtered.sort((a, b) => a.id - b.id); break;
        case "az": filtered.sort((a, b) => String(a.brand || "").localeCompare(String(b.brand || ""))); break;
        case "za": filtered.sort((a, b) => String(b.brand || "").localeCompare(String(a.brand || ""))); break;
        case "low": filtered.sort((a, b) => parseFloat(String(a.new_price || "").replace(/[^0-9.]/g, "")) - parseFloat(String(b.new_price || "").replace(/[^0-9.]/g, ""))); break;
        case "high": filtered.sort((a, b) => parseFloat(String(b.new_price || "").replace(/[^0-9.]/g, "")) - parseFloat(String(a.new_price || "").replace(/[^0-9.]/g, ""))); break;
        default: filtered.sort((a, b) => b.id - a.id);
    }

    renderWatches(filtered);
}
