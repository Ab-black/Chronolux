// ======================================
// LOAD ADMIN WATCHES
// ======================================

let editingWatchId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadAdminWatches();
});

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
                <img src="${watch.image}"
                     class="watch-thumb">
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

                    data-id="${watch.id}"
                    data-brand="${watch.brand}"
                    data-model="${watch.model}"
                    data-old="${watch.old_price}"
                    data-new="${watch.new_price}"
                    data-description="${watch.description || ""}"
                    data-featured="${watch.featured}">

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

    setupEditButtons();

    setupDeleteButtons();

}

function setupEditButtons() {

    document.querySelectorAll(".edit-btn").forEach(button => {

        button.addEventListener("click", () => {

            editingWatchId = button.dataset.id;

            document.getElementById("brand").value =
                button.dataset.brand;

            document.getElementById("model").value =
                button.dataset.model;

            document.getElementById("oldPrice").value =
                button.dataset.old;

            document.getElementById("newPrice").value =
                button.dataset.new;

            document.getElementById("description").value =
                button.dataset.description;

            document.getElementById("featured").checked =
                button.dataset.featured === "true";

            const saveBtn = document.querySelector("#watch-form button[type='submit']");

            saveBtn.innerHTML = `
                <i class="fas fa-pen"></i>
                Update Watch
            `;

            document
                .getElementById("add-watch")
                .scrollIntoView({
                    behavior: "smooth"
                });

        });

    });

}

function setupDeleteButtons() {

    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", async () => {

            if (!confirm("Delete this watch?")) return;

            const id = button.dataset.id;

            const { error } = await supabaseClient
                .from("watches")
                .delete()
                .eq("id", id);

            if (error) {

                alert(error.message);

                return;

            }

            alert("Watch deleted.");

            loadAdminWatches();

        });

    });

}
