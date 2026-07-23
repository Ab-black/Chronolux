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

    alert("saveWatch started");

    const brand = document.getElementById("brand").value;
    const model = document.getElementById("model").value;
    const oldPrice = document.getElementById("oldPrice").value;
    const newPrice = document.getElementById("newPrice").value;
    const description = document.getElementById("description").value;

    const movement = document.getElementById("movement").value;
    const caseMaterial = document.getElementById("caseMaterial").value;
    const caseSize = document.getElementById("caseSize").value;
    const waterResistance = document.getElementById("waterResistance").value;
    const condition = document.getElementById("condition").value;

    const featured = document.getElementById("featured").checked;
// ======================================
// AUTO MANAGE FEATURED WATCHES
// ======================================

if (featured) {

    const { data: featuredWatches } = await supabaseClient
        .from("watches")
        .select("id")
        .eq("featured", true)
        .order("id", { ascending: true });

    if (featuredWatches.length >= 3) {

        const oldestWatch = featuredWatches[0];

        await supabaseClient
            .from("watches")
            .update({
                featured: false
            })
            .eq("id", oldestWatch.id);

    }

}
    const imageFile = document.getElementById("mainImage").files[0];
    const imageFile2 = document.getElementById("image2").files[0];
    const imageFile3 = document.getElementById("image3").files[0];
    const imageFile4 = document.getElementById("image4").files[0];
    const imageFile5 = document.getElementById("image5").files[0];
    
    let imageUrl = null;
    let imageUrl2 = null;
    let imageUrl3 = null;
    let imageUrl4 = null;
    let imageUrl5 = null;

    // Upload Main Image
    if (imageFile) {
    
        imageUrl = await uploadImage(imageFile);
    
        if (!imageUrl) return;
    
    }
    
    // Upload Gallery Image 2
    if (imageFile2) {
    
        imageUrl2 = await uploadImage(imageFile2);
    
        if (!imageUrl2) return;
    
    }
    
    // Upload Gallery Image 3
    if (imageFile3) {
    
        imageUrl3 = await uploadImage(imageFile3);
    
        if (!imageUrl3) return;
    
    }
    
    // Upload Gallery Image 4
    if (imageFile4) {
    
        imageUrl4 = await uploadImage(imageFile4);
    
        if (!imageUrl4) return;
    
    }
    
    // Upload Gallery Image 5
    if (imageFile5) {
    
        imageUrl5 = await uploadImage(imageFile5);
    
        if (!imageUrl5) return;
    
    }

    // Editing and no new image selected
    if (editingWatchId && !imageUrl) {

    imageUrl = window.currentWatchImage;

}

    // Adding new watch requires image
    if (!editingWatchId && !imageUrl) {

        alert("Please select a watch image.");

        return;

    }

    const slug = model
        .toLowerCase()
        .replace(/\s+/g, "-");

    const watchData = {

        brand: brand,
        model: model,
        slug: slug,
        old_price: oldPrice,
        new_price: newPrice,
        description: description,
    
        image: imageUrl || window.currentWatchImage,
    
        image2: imageUrl2 || window.currentWatchImage2 || null,
        image3: imageUrl3 || window.currentWatchImage3 || null,
        image4: imageUrl4 || window.currentWatchImage4 || null,
        image5: imageUrl5 || window.currentWatchImage5 || null,
    
        featured: featured,
    
        movement: movement,
        case_material: caseMaterial,
        case_size: caseSize,
        water_resistance: waterResistance,
        condition: condition
    
    };

    let result;

    alert("editingWatchId = " + editingWatchId);

    if (editingWatchId) {

        alert("Updating watch...");

        result = await supabaseClient
            .from("watches")
            .update(watchData)
            .eq("id", editingWatchId);

    } else {

        alert("Adding new watch...");

        result = await supabaseClient
            .from("watches")
            .insert([watchData]);

    }

    const { error } = result;

    if (error) {

        alert(error.message);

        return;

    }

    alert(
        editingWatchId
            ? "Watch updated successfully!"
            : "Watch added successfully!"
    );

    // Reset form
document.getElementById("watch-form").reset();

// Hide current image preview
const preview = document.getElementById("currentImage");

if (preview) {
    preview.src = "";
    preview.style.display = "none";
}

// Clear stored image
window.currentWatchImage = null;

// Exit edit mode
editingWatchId = null;

// Restore button text
document.getElementById("save-watch-btn").innerHTML = `
    <i class="fas fa-save"></i>
    Save Watch
`;

// Restore page title
document.getElementById("page-title").textContent = "Add Watch";

// Reload inventory
loadAdminWatches();

}
