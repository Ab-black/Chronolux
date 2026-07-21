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

    const imageFile = document.getElementById("mainImage").files[0];

    let imageUrl = null;

    // Upload new image if selected
    if (imageFile) {

        imageUrl = await uploadImage(imageFile);

        if (!imageUrl) return;

    }

    // Editing and no new image selected
    if (editingWatchId && !imageUrl) {

        alert("editingWatchId = " + editingWatchId);

        const { data } = await supabaseClient
            .from("watches")
            .select("image")
            .eq("id", editingWatchId)
            .single();

        imageUrl = data.image;

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
        image: imageUrl,
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

    document.getElementById("watch-form").reset();

    editingWatchId = null;

    document.getElementById("save-watch-btn").innerHTML = `
        <i class="fas fa-save"></i>
        Save Watch
    `;

    loadAdminWatches();

}
