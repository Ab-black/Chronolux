// ======================================
// LOAD ADMIN WATCHES
// ======================================

console.log("✅ load-admin-watches.js loaded");

let editingWatchId = null;

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ DOM Loaded");
    loadAdminWatches();
});
async function loadAdminWatches() {

    const tbody = document.querySelector(".inventory-table tbody");

    if (!tbody) return;

    const { data: watches, error } = await supabaseClient
        .from("watches")
        .select("*")
        .order("id", { ascending: false });
console.log("Supabase data:", watches);
console.log("Supabase error:", error);
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
                
                    data-movement="${watch.movement || ""}"
                    data-case-material="${watch.case_material || ""}"
                    data-case-size="${watch.case_size || ""}"
                    data-water-resistance="${watch.water_resistance || ""}"
                    data-condition="${watch.condition || ""}"
                
                    data-image="${watch.image || ""}"
                
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

                alert("Edit clicked");
            
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

            document.getElementById("movement").value =
                button.dataset.movement;
            
            document.getElementById("caseMaterial").value =
                button.dataset.caseMaterial;
            
            document.getElementById("caseSize").value =
                button.dataset.caseSize;
            
            document.getElementById("waterResistance").value =
                button.dataset.waterResistance;
            
            document.getElementById("condition").value =
                button.dataset.condition;
            
            document.getElementById("featured").checked =
                button.dataset.featured === "true";

            const saveBtn = document.querySelector("#watch-form button[type='submit']");

            saveBtn.innerHTML = `
                <i class="fas fa-pen"></i>
                Update Watch
            `;

            // Open the Add Watch page

document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
});

document.getElementById("add-watch").classList.add("active-page");

// Highlight sidebar

document.querySelectorAll(".sidebar-menu li").forEach(item => {
    item.classList.remove("active");
});

document
    .querySelector('[data-page="add-watch"]')
    .classList.add("active");

// Change page title

document.getElementById("page-title").textContent = "Edit Watch";

// Scroll to form

document
    .getElementById("watch-form")
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
