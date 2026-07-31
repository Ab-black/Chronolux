// ==========================================
// CHRONOLUX COLLECTION
// ==========================================

let allWatches = [];

document.addEventListener("DOMContentLoaded", loadCollection);

async function loadCollection() {

    const grid = document.getElementById("watch-grid");

    if (!grid) return;

    grid.innerHTML = "<p>Loading watches...</p>";

    const { data: watches, error } = await supabaseClient
        .from("watches")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error(error);

        grid.innerHTML = "<p>Unable to load watches.</p>";

        return;

    }

    allWatches = watches;

    populateBrandFilter(watches);

    renderWatches(watches);

    // Search
    document
        .getElementById("watch-search")
        .addEventListener("input", filterWatches);

    // Brand
    document
        .getElementById("brand-filter")
        .addEventListener("change", filterWatches);

    // Sort
    document
        .getElementById("sort-filter")
        .addEventListener("change", filterWatches);

}

// ==========================================
// RENDER WATCHES
// ==========================================

function renderWatches(watches) {

    const grid = document.getElementById("watch-grid");

    if (watches.length === 0) {

        grid.innerHTML = "<p>No watches found.</p>";

        return;

    }

    grid.innerHTML = "";

    watches.forEach(watch => {

        grid.innerHTML += `

        <div
    class="watch-card"
    onclick="window.location.href='product.html?slug=${watch.slug}'">

            <div class="watch-image">

                <img src="${watch.image}" alt="${watch.model}">

            </div>

            <div class="watch-details">

                <span>${watch.brand}</span>

                <h3>${watch.model}</h3>

                <h4 class="watch-price">

                    <span class="old-price">${watch.old_price}</span>

                    <span class="new-price">${watch.new_price}</span>

                </h4>

                <a
                    href="product.html?slug=${watch.slug}"
                    class="watch-btn">

                    View Details

                </a>

            </div>

        </div>

        `;

    });

}

// ==========================================
// BRAND FILTER
// ==========================================

function populateBrandFilter(watches) {

    const brandFilter = document.getElementById("brand-filter");

    brandFilter.innerHTML =
        `<option value="all">All Brands</option>`;

    const brands = [...new Set(watches.map(w => w.brand))];

    brands.sort();

    brands.forEach(brand => {

        brandFilter.innerHTML +=
            `<option value="${brand}">${brand}</option>`;

    });

}

// ==========================================
// FILTER + SORT
// ==========================================

function filterWatches() {

    const search = document
        .getElementById("watch-search")
        .value
        .toLowerCase();

    const brand = document
        .getElementById("brand-filter")
        .value;

    const sort = document
        .getElementById("sort-filter")
        .value;

    let filtered = allWatches.filter(watch => {

        const matchesSearch =

            watch.brand.toLowerCase().includes(search) ||

            watch.model.toLowerCase().includes(search);

        const matchesBrand =

            brand === "all" ||

            watch.brand === brand;

        return matchesSearch && matchesBrand;

    });

    switch (sort) {

        case "oldest":

            filtered.sort((a, b) => a.id - b.id);

            break;

        case "az":

            filtered.sort((a, b) =>
                a.brand.localeCompare(b.brand));

            break;

        case "za":

            filtered.sort((a, b) =>
                b.brand.localeCompare(a.brand));

            break;

        case "low":

            filtered.sort((a, b) =>

                parseFloat(a.new_price.replace(/[^0-9.]/g, "")) -

                parseFloat(b.new_price.replace(/[^0-9.]/g, ""))

            );

            break;

        case "high":

            filtered.sort((a, b) =>

                parseFloat(b.new_price.replace(/[^0-9.]/g, "")) -

                parseFloat(a.new_price.replace(/[^0-9.]/g, ""))

            );

            break;

        default:

            filtered.sort((a, b) => b.id - a.id);

    }

    renderWatches(filtered);

}
