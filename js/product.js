// ======================================
// CHRONOLUX PRODUCT PAGE
// ======================================

document.addEventListener("DOMContentLoaded", loadProduct);

async function loadProduct() {

    const params = new URLSearchParams(window.location.search);

    const slug = params.get("slug");

    if (!slug) {

        alert("Product not found.");

        return;

    }

        const { data: watch, error } = await supabaseClient
        .from("watches")
        .select("*")
        .eq("slug", slug)
        .single();
    
    if (error) {
    
        console.log(error);
    
        return;
    
    }
    
    // Load gallery images
    const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("watch_images")
        .select("*")
        .eq("watch_id", watch.id)
        .order("sort_order", { ascending: true });
    
    if (galleryError) {
    
        console.log(galleryError);
    
    }

    // =============================
    // PAGE TITLE
    // =============================

    document.title =
        `${watch.brand} ${watch.model} | ChronoLux`;

    // =============================
    // IMAGE
    // =============================

    const image = document.getElementById("product-image");

    image.src = watch.image;

    const thumbContainer = document.getElementById("thumbnail-gallery");

    thumbContainer.innerHTML = "";
    
    // Main image first
    const allImages = [
        watch.image,
        ...(galleryImages || []).map(img => img.image_url)
    ];
    
    allImages.forEach(url => {
    
        const thumb = document.createElement("img");
    
        thumb.src = url;
    
        thumb.onclick = () => {
    
            image.src = url;
    
        };
    
        thumbContainer.appendChild(thumb);
    
    });
    
    image.alt = `${watch.brand} ${watch.model}`;

    // =============================
    // GALLERY
    // =============================
    
    const galleryContainer =
        document.getElementById("gallery-thumbnails");
    
    galleryContainer.innerHTML = "";

    if (galleryImages && galleryImages.length > 0) {

    galleryImages.forEach((item, index) => {

        const thumb = document.createElement("img");

        thumb.src = item.image_url;

        thumb.className = "gallery-thumb";

        if (index === 0) {

            thumb.classList.add("active-thumb");

        }

        thumb.onclick = () => {

            image.src = item.image_url;

            document
                .querySelectorAll(".gallery-thumb")
                .forEach(img => {

                    img.classList.remove("active-thumb");

                });

            thumb.classList.add("active-thumb");

        };

        galleryContainer.appendChild(thumb);

    });

}
    
    // =============================
    // BRAND
    // =============================

    document.getElementById("product-brand").textContent =
        watch.brand;

    // =============================
    // MODEL
    // =============================

    document.getElementById("product-name").textContent =
        watch.model;

    // =============================
    // PRICES
    // =============================

    document.getElementById("old-price").textContent =
        watch.old_price;

    document.getElementById("new-price").textContent =
        watch.new_price;

    // =============================
    // DESCRIPTION
    // =============================

    document.getElementById("product-description").textContent =
        watch.description;

    // =============================
    // SPECIFICATIONS
    // =============================

    document.getElementById("product-specs").innerHTML = `

        <li><strong>Brand:</strong> ${watch.brand}</li>

        <li><strong>Model:</strong> ${watch.model}</li>

        <li><strong>Movement:</strong> ${watch.movement}</li>

        <li><strong>Case:</strong> ${watch.case_material}</li>

        <li><strong>Case Size:</strong> ${watch.case_size}</li>

        <li><strong>Water Resistance:</strong> ${watch.water_resistance}</li>

        <li><strong>Condition:</strong> ${watch.condition}</li>

    `;

    // =============================
    // WHATSAPP BUTTON
    // =============================

    const pageURL = window.location.href;

    const message = `Hello ChronoLux,

I'm interested in this luxury watch.

Brand: ${watch.brand}
Model: ${watch.model}

Price: ${watch.new_price}

Product Page:
${pageURL}

Could you please let me know:

• Is it still available?
• What is the condition?
• Shipping options
• Payment procedure

Thank you.`;

    document.getElementById("whatsapp-btn").href =
        `https://wa.me/2349039450751?text=${encodeURIComponent(message)}`;

}
