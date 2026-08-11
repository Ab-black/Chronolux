// ======================================
// CHRONOLUX WATCH UPLOAD / EDIT
// ======================================

async function uploadImage(file) {

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabaseClient
        .storage
        .from("watch-images")
        .upload(fileName, file);

    if (error) {
        alert(error.message);
        return null;
    }

    const { data } = supabaseClient
        .storage
        .from("watch-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}

async function saveWatch(e) {

    e.preventDefault();

    const brand = document.getElementById("brand").value;
    const model = document.getElementById("model").value;
    const oldPrice = document.getElementById("oldPrice").value;
    const newPrice = document.getElementById("newPrice").value;
    const collection = document.getElementById("collection")?.value || "";
    const description = document.getElementById("description").value;

    const movement = document.getElementById("movement").value;
    const caseMaterial = document.getElementById("caseMaterial").value;
    const caseSize = document.getElementById("caseSize").value;
    const waterResistance = document.getElementById("waterResistance").value;
    const condition = document.getElementById("condition").value;
    const featured = document.getElementById("featured").checked;

    if (!collection && !editingWatchId) {
        alert("Please select a collection.");
        return;
    }

    // ======================================
    // AUTO MANAGE FEATURED WATCHES
    // ======================================

    if (featured) {

        const { data: featuredWatches, error: featuredError } = await supabaseClient
            .from("watches")
            .select("id")
            .eq("featured", true)
            .order("id", { ascending: true });

        if (featuredError) {
            alert(featuredError.message);
            return;
        }

        const otherFeaturedWatches = (featuredWatches || []).filter(
            watch => String(watch.id) !== String(editingWatchId)
        );

        if (otherFeaturedWatches.length >= 3) {

            const oldestWatch = otherFeaturedWatches[0];

            const { error: unfeatureError } = await supabaseClient
                .from("watches")
                .update({ featured: false })
                .eq("id", oldestWatch.id);

            if (unfeatureError) {
                alert(unfeatureError.message);
                return;
            }
        }
    }

    const imageFile = document.getElementById("mainImage").files[0];
    const galleryFiles = [
        document.getElementById("image2").files[0],
        document.getElementById("image3").files[0],
        document.getElementById("image4").files[0],
        document.getElementById("image5").files[0]
    ];

    // ======================================
    // MAIN IMAGE
    // ======================================

    // If no new main image is selected while editing,
    // the existing main image remains unchanged.
    let imageUrl = null;

    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) return;
    }

    if (!imageUrl && editingWatchId) {
        imageUrl = window.currentWatchImage || null;
    }

    if (!editingWatchId && !imageUrl) {
        alert("Please select a watch image.");
        return;
    }

    // ======================================
    // GALLERY IMAGES
    // ======================================

    // Existing gallery images are loaded when Edit is clicked.
    // A blank file input means KEEP the existing image in that position.
    const existingGallery = Array.isArray(window.currentGallery)
        ? [...window.currentGallery]
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(item => typeof item === "string" ? item : item.image_url)
        : [];

    const mergedGallery = [...existingGallery];
    let galleryChanged = false;

    for (let i = 0; i < galleryFiles.length; i++) {

        const file = galleryFiles[i];
        if (!file) continue;

        const url = await uploadImage(file);
        if (!url) return;

        // image2 = position 0, image3 = position 1, etc.
        mergedGallery[i] = url;
        galleryChanged = true;
    }

    while (mergedGallery.length && !mergedGallery[mergedGallery.length - 1]) {
        mergedGallery.pop();
    }

    const slug = model
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    const watchData = {
        brand,
        model,
        slug,
        old_price: oldPrice,
        new_price: newPrice,
        collection: collection || window.currentWatchCollection || null,
        description,
        image: imageUrl,
        featured,
        movement,
        case_material: caseMaterial,
        case_size: caseSize,
        water_resistance: waterResistance,
        condition
    };

    let result;
    let watchId;

    if (editingWatchId) {

        result = await supabaseClient
            .from("watches")
            .update(watchData)
            .eq("id", editingWatchId)
            .select()
            .single();

        watchId = editingWatchId;

    } else {

        result = await supabaseClient
            .from("watches")
            .insert([watchData])
            .select()
            .single();

        watchId = result.data?.id;
    }

    if (result.error) {
        alert(result.error.message);
        return;
    }

    // ======================================
    // SAVE GALLERY WITHOUT LOSING EXISTING IMAGES
    // ======================================

    // If editing without selecting any gallery file, the existing
    // watch_images rows are left completely untouched.
    // If a gallery image was changed/added, rebuild the rows using the
    // merged list so untouched images are retained too.
    if (!editingWatchId || galleryChanged) {

        const { error: deleteGalleryError } = await supabaseClient
            .from("watch_images")
            .delete()
            .eq("watch_id", watchId);

        if (deleteGalleryError) {
            alert(deleteGalleryError.message);
            return;
        }

        for (let i = 0; i < mergedGallery.length; i++) {

            if (!mergedGallery[i]) continue;

            const { error: galleryInsertError } = await supabaseClient
                .from("watch_images")
                .insert({
                    watch_id: watchId,
                    image_url: mergedGallery[i],
                    sort_order: i + 1
                });

            if (galleryInsertError) {
                alert(galleryInsertError.message);
                return;
            }
        }
    }

    // ======================================
    // RESET FORM
    // ======================================

    document.getElementById("watch-form").reset();

    const preview = document.getElementById("currentImage");
    if (preview) {
        preview.src = "";
        preview.style.display = "none";
    }

    const galleryPreview = document.getElementById("currentGalleryPreview");
    if (galleryPreview) galleryPreview.innerHTML = "";

    window.currentWatchImage = null;
    window.currentGallery = [];
    window.currentWatchCollection = null;

    editingWatchId = null;

    document.getElementById("save-watch-btn").innerHTML = `
        <i class="fas fa-save"></i>
        Save Watch
    `;

    document.getElementById("page-title").textContent = "Add Watch";

    loadAdminWatches();
}
