async function uploadImage(file) {

    const fileName =
    `${Date.now()}-${file.name}`;

    const { error } = await supabaseClient
    .storage
    .from("watch-images")
    .upload(fileName, file);

    if (error) {
        alert(error.message);
        return null;
    }

    const { data } =
    supabaseClient
    .storage
    .from("watch-images")
    .getPublicUrl(fileName);

    return data.publicUrl;

}
