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
    const description = document.getElementById("description").value;

    const movement = document.getElementById("movement").value;
    const caseMaterial = document.getElementById("caseMaterial").value;
    const caseSize = document.getElementById("caseSize").value;
    const waterResistance = document.getElementById("waterResistance").value;
    const condition = document.getElementById("condition").value;

    const featured = document.getElementById("featured").checked;

    const imageFile = document.getElementById("mainImage").files[0];

    if (!imageFile) {
        alert("Please select a watch image.");
        return;
    }

    const imageUrl = await uploadImage(imageFile);

    if (!imageUrl) return;

    const slug = model
        .toLowerCase()
        .replace(/\s+/g, "-");

    const { error } = await supabaseClient
        .from("watches")
        .insert([
            {
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
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Watch added successfully!");

    document.getElementById("watch-form").reset();
}
