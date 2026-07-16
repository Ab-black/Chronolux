// ======================================
// ADMIN WATCHES
// ======================================

let editingWatchId = null;

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

    // ==========================
    // DELETE WATCH
    // ==========================

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.onclick = async () => {

            const id = button.dataset.id;

            if (!confirm("Delete this watch?")) return;

            const { error } = await supabaseClient
                .from("watches")
                .delete()
                .eq("id", id);

            if (error) {

                alert(error.message);

                return;

            }

            alert("Watch deleted successfully.");

            loadAdminWatches();

        };

    });

    // ==========================
    // EDIT WATCH
    // ==========================

    document.querySelectorAll(".edit-btn").forEach(button => {

        button.onclick = async () => {

            const id = button.dataset.id;

            const { data: watch, error } = await supabaseClient
                .from("watches")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {

                alert(error.message);

                return;

            }

            editingWatchId = watch.id;

            document.getElementById("brand").value = watch.brand || "";

            document.getElementById("model").value = watch.model || "";

            document.getElementById("oldPrice").value = watch.old_price || "";

            document.getElementById("newPrice").value = watch.new_price || "";

            document.getElementById("description").value = watch.description || "";

            document.getElementById("movement").value = watch.movement || "";

            document.getElementById("caseMaterial").value = watch.case_material || "";

            document.getElementById("caseSize").value = watch.case_size || "";

            document.getElementById("waterResistance").value = watch.water_resistance || "";

            document.getElementById("condition").value = watch.condition || "";

            document.getElementById("featured").checked = watch.featured;

            document.getElementById("save-watch-btn").innerHTML = `

                <i class="fas fa-pen"></i>

                Update Watch

            `;

            document
                .getElementById("add-watch")
                .scrollIntoView({
                    behavior: "smooth"
                });

        };

    });

}
