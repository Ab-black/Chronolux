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

                <h3>

                    <a href="product.html?slug=${watch.slug}">
                        ${watch.model}
                    </a>

                </h3>

                <h4 class="watch-price">

                    <span class="old-price">
                        ${watch.old_price}
                    </span>

                    <span class="new-price">
                        ${watch.new_price}
                    </span>

                </h4>

                <a
                    href="https://wa.me/2349039450751?text=${encodeURIComponent(
`Hello ChronoLux,

I'm interested in purchasing this watch.

Brand: ${watch.brand}
Model: ${watch.model}
Price: ${watch.new_price}

Product Link:
${location.origin}${location.pathname.replace("index.html","")}product.html?slug=${watch.slug}`)}"

                    class="watch-btn"
                    target="_blank">

                    Request Availability

                </a>

            </div>

        </div>

        `;

    });

}
