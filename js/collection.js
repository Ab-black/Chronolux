// ==========================================
// CHRONOLUX COLLECTION
// ==========================================

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

    if (watches.length === 0) {

        grid.innerHTML = "<p>No watches available.</p>";

        return;

    }

    grid.innerHTML = "";

    watches.forEach(watch => {

        grid.innerHTML += `

        <div class="watch-card">

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
                    href="https://wa.me/2349039450751?text=${encodeURIComponent(
                        `Hello, I'm interested in the ${watch.brand} ${watch.model}.`
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

document.addEventListener("DOMContentLoaded", loadCollection);
