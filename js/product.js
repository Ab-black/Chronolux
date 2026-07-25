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
    
    console.log("Slug:", slug);
    console.log("Watch:", watch);
    console.log("Description:", watch.description);
    
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
    console.log("Gallery Images:", galleryImages);
    
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

const gallery = document.getElementById("gallery-thumbnails");

gallery.innerHTML = "";

// Build image array
const allImages = [

    watch.image,

    ...(galleryImages || []).map(img => img.image_url)

];

// Set first image

image.src = allImages[0];

image.alt = `${watch.brand} ${watch.model}`;

// Detect mobile

const mobile = window.innerWidth <= 768;

// Create gallery

allImages.forEach((url,index)=>{

    const item=document.createElement("div");

    item.className="gallery-dot";

    if(mobile){

        item.innerHTML=`<img src="${url}" alt="">`;

    }

    if(index===0){

        item.classList.add("active");

    }

    item.onclick=()=>{

        image.style.opacity="0";

        setTimeout(()=>{

            image.src=url;

            image.style.opacity="1";

        },180);

        document

            .querySelectorAll(".gallery-dot")

            .forEach(el=>el.classList.remove("active"));

        item.classList.add("active");

    };

    gallery.appendChild(item);

});

    
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
