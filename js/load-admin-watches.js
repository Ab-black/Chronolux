// ======================================
// LOAD WATCHES INTO ADMIN TABLE
// ======================================

document.addEventListener("DOMContentLoaded", loadAdminWatches);

async function loadAdminWatches() {

    console.log("Loading watches...");

    const tbody = document.querySelector(".inventory-table tbody");

    if (!tbody) {

        console.log("Table body not found");

        return;

    }

    const { data, error } = await supabaseClient
        .from("watches")
        .select("*")
        .order("id", { ascending: false });

    console.log("Data:", data);

    console.log("Error:", error);

    if (error) {

        alert(error.message);

        return;

    }

    tbody.innerHTML = "";

    data.forEach(watch => {

        tbody.innerHTML += `
        <tr>

            <td>
                <img src="${watch.image}" class="watch-thumb">
            </td>

            <td>${watch.brand}</td>

            <td>${watch.model}</td>

            <td>${watch.new_price}</td>

            <td>${watch.featured ? "Featured" : "Normal"}</td>

            <td>

                <button class="icon-btn">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="icon-btn delete">
                    <i class="fas fa-trash"></i>
                </button>

            </td>

        </tr>
        `;

    });

}
