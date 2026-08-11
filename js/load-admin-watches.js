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
                <img src="${watch.image}" class="watch-thumb">
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
                    data-collection="${watch.collection || ""}"
                    data-description="${watch.description || ""}"
                    data-featured="${watch.featured}"
                    data-image="${watch.image || ""}"
                    data-movement="${watch.movement || ""}"
                    data-case-material="${watch.case_material || ""}"
                    data-case-size="${watch.case_size || ""}"
                    data-water-resistance="${watch.water_resistance || ""}"
                    data-condition="${watch.condition || ""}">
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

async function setupEditButtons() {

    document.querySelectorAll(".edit-btn").forEach(button => {

        button.addEventListener("click", async () => {

            editingWatchId = button.dataset.id;

            document.getElementById("brand").value = button.dataset.brand;
            document.getElementById("model").value = button.dataset.model;
            document.getElementById("oldPrice").value = button.dataset.old;
            document.getElementById("newPrice").value = button.dataset.new;
            document.getElementById("description").value = button.dataset.description;
            document.getElementById("movement").value = button.dataset.movement;
            document.getElementById("caseMaterial").value = button.dataset.caseMaterial;
            document.getElementById("caseSize").value = button.dataset.caseSize;
            document.getElementById("waterResistance").value = button.dataset.waterResistance;
            document.getElementById("condition").value = button.dataset.condition;
            document.getElementById("featured").checked = button.dataset.featured === "true";

            const collectionSelect = document.getElementById("collection");
            if (collectionSelect) {
                collectionSelect.value = button.dataset.collection || "";
            }

            window.currentWatchCollection = button.dataset.collection || null;
            window.currentWatchImage = button.dataset.image || null;

            // Load the real gallery from watch_images.
            const { data: galleryImages, error: galleryError } = await supabaseClient
                .from("watch_images")
                .select("id, image_url, sort_order")
                .eq("watch_id", editingWatchId)
                .order("sort_order", { ascending: true });

            if (galleryError) {
                console.error("Unable to load gallery images:", galleryError);
                window.currentGallery = [];
            } else {
                window.currentGallery = galleryImages || [];
            }

            renderCurrentGallery(window.currentGallery);

            const preview = document.getElementById("currentImage");
            if (preview && window.currentWatchImage) {
                preview.src = window.currentWatchImage;
                preview.style.display = "block";
            }

            const saveBtn = document.querySelector("#watch-form button[type='submit']");
            saveBtn.innerHTML = `
                <i class="fas fa-pen"></i>
                Update Watch
            `;

            document.querySelectorAll(".page").forEach(page => {
                page.classList.remove("active-page");
            });

            document.getElementById("add-watch").classList.add("active-page");

            document.querySelectorAll(".sidebar-menu li").forEach(item => {
                item.classList.remove("active");
            });

            document.querySelector('[data-page="add-watch"]').classList.add("active");
            document.getElementById("page-title").textContent = "Edit Watch";

            document.getElementById("watch-form").scrollIntoView({
                behavior: "smooth"
            });
        });
    });
}

function renderCurrentGallery(images) {

    let container = document.getElementById("currentGalleryPreview");

    if (!container) {
        const anchor = document.getElementById("currentImage")?.closest(".form-group");
        if (!anchor) return;

        container = document.createElement("div");
        container.id = "currentGalleryPreview";
        container.style.cssText = `
            display:flex;
            flex-wrap:wrap;
            gap:12px;
            margin-top:16px;
        `;

        anchor.appendChild(container);
    }

    container.innerHTML = "";

    if (!images || !images.length) return;

    images.forEach((item, index) => {

        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
            position:relative;
            width:110px;
        `;

        const img = document.createElement("img");
        img.src = item.image_url;
        img.alt = `Gallery image ${index + 2}`;
        img.style.cssText = `
            width:110px;
            height:110px;
            object-fit:cover;
            border-radius:10px;
            border:1px solid rgba(200,169,106,.35);
            display:block;
        `;

        const label = document.createElement("small");
        label.textContent = `Gallery ${index + 2}`;
        label.style.cssText = `
            display:block;
            margin-top:5px;
            color:#c8a96a;
            text-align:center;
        `;

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
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
