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
    const specifications = document.getElementById("specifications").value;
    const featured = document.getElementById("featured").checked;

    const imageFile = document.getElementById("mainImage").files[0];

    if (!imageFile) {
        alert("Please select a watch image.");
        return;
    }

    const imageUrl = await uploadImage(imageFile);

    if (!imageUrl) return;

    const { error } = await supabaseClient
        .from("watches")
        .insert([
            {
                brand: brand,
                model: model,
                old_price: oldPrice,
                new_price: newPrice,
                description: description,
                image: imageUrl,
                specifications: specifications,
                featured: featured
            }
        ]);

    if (error) {
        alert(error.message);
        return;
    }

    alert("Watch added successfully!");

    document.getElementById("watch-form").reset();

}
