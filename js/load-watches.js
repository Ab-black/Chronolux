// ======================================
// LOAD FEATURED WATCHES FROM SUPABASE
// ======================================

async function loadWatches() {

    const grid = document.getElementById("watch-grid");

    if (!grid) return;

    const { data: watches, error } = await supabaseClient
        .from("watches")
        .select("*")
        .eq("featured", true)
        .limit(3)
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    // If no featured watches exist,
    // keep the original homepage cards.
    if (!watches || watches.length === 0) {
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

                <h3>

                    <a href="product.html?slug=${watch.slug}">

                        ${watch.model}

                    </a>

                </h3>

                <h4 class="watch-price">

                    <span class="old-price">${watch.old_price}</span>

                    <span class="new-price">${watch.new_price}</span>

                </h4>

                <a
                    href="https://wa.me/2349039450751?text=${encodeURIComponent(
                        `Hello, I'm interested in the ${watch.brand} ${watch.model}. ${window.location.origin}/product.html?slug=${watch.slug}`
                    )}"
                    target="_blank"
                    class="watch-btn">

                    Request Availability

                </a>

            </div>

        </div>

        `;

    });

}

document.addEventListener("DOMContentLoaded", loadWatches);
