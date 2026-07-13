// ======================================
// LOAD WATCHES INTO ADMIN TABLE
// ======================================

document.addEventListener("DOMContentLoaded", loadAdminWatches);

async function loadAdminWatches() {

    const tbody = document.querySelector(".inventory-table tbody");

    if (!tbody) return;

    const { data: watches, error } = await supabaseClient
        .from("watches")
        .select("*")
        .order("id", { ascending: false });

    if (error) {

        console.error(error);

        return;

    }

    tbody.innerHTML = "";

    watches.forEach(watch => {

        tbody.innerHTML += `

        <tr>

            <td>

                <img
                    src="${watch.image}"
                    class="watch-thumb"
                    alt="${watch.model}">

            </td>

            <td>${watch.brand}</td>

            <td>${watch.model}</td>

            <td>${watch.new_price}</td>

            <td>

                <span class="status ${watch.featured ? "featured" : ""}">

                    ${watch.featured ? "Featured" : "Normal"}

                </span>

            </td>

            <td>

                <button
                    class="icon-btn edit-btn"
                    data-id="${watch.id}">

                    <i class="fas fa-edit"></i>

                </button>

                <button
                    class="icon-btn delete delete-btn"
                    data-id="${watch.id}">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}
