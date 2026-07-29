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
// IMAGE GALLERY
// =============================

const image = document.getElementById("product-image");

const dotsContainer = document.getElementById("gallery-dots");

const thumbContainer = document.getElementById("gallery-thumbnails");

const prevBtn = document.getElementById("gallery-prev");

const nextBtn = document.getElementById("gallery-next");

// =============================
// LIGHTBOX ELEMENTS
// =============================

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightbox-image");

const lightboxDots = document.getElementById("lightbox-dots");

const lightboxPrev = document.getElementById("lightbox-prev");

const lightboxNext = document.getElementById("lightbox-next");

const lightboxClose = document.getElementById("lightbox-close");
// Build gallery

const allImages = [

    watch.image,

    ...(galleryImages || []).map(img => img.image_url)

];

// Current image index

let currentIndex = 0;

// Show image

function showImage(index){

    currentIndex = index;

    image.style.opacity = "0";

    setTimeout(()=>{

        image.src = allImages[currentIndex];

        lightboxImage.src = allImages[currentIndex];

        image.style.opacity = "1";

    },180);

    // Active dot

    document.querySelectorAll(".gallery-dot").forEach((dot,i)=>{

        dot.classList.toggle("active", i===currentIndex);

    });

    // Active thumbnail

    document.querySelectorAll(".gallery-thumb").forEach((thumb,i)=>{

        thumb.classList.toggle("active", i===currentIndex);

    });

}

// Clear old content

dotsContainer.innerHTML = "";

thumbContainer.innerHTML = "";

// Build gallery controls

allImages.forEach((url,index)=>{

    // Desktop dots

    const dot = document.createElement("div");

    dot.className = "gallery-dot";

    if(index===0){

        dot.classList.add("active");

    }

    dot.onclick = ()=>showImage(index);

    dotsContainer.appendChild(dot);

    // Mobile thumbnail

    const thumb = document.createElement("img");

    thumb.src = url;

    thumb.className = "gallery-thumb";

    if(index===0){

        thumb.classList.add("active");

    }

    thumb.onclick = ()=>showImage(index);

    thumbContainer.appendChild(thumb);

});

// Previous button

prevBtn.onclick = ()=>{

    currentIndex--;

    if(currentIndex<0){

        currentIndex = allImages.length-1;

    }

    showImage(currentIndex);

};

// Next button

nextBtn.onclick = ()=>{

    currentIndex++;

    if(currentIndex>=allImages.length){

        currentIndex = 0;

    }

    showImage(currentIndex);

};

// Initial image

showImage(0);

    // =============================
// OPEN LIGHTBOX
// =============================

image.onclick = () => {

    lightbox.classList.add("show");

    lightboxImage.src = allImages[currentIndex];

};

// =============================
// CLOSE LIGHTBOX
// =============================

lightboxClose.onclick = () => {

    lightbox.classList.remove("show");

};

// =============================
// CLICK OUTSIDE TO CLOSE
// =============================

lightbox.addEventListener("click", function (e) {

    if (!e.target.closest(".lightbox-content")) {

        lightbox.classList.remove("show");

    }

});
    
// =============================
// ESC KEY
// =============================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        lightbox.classList.remove("show");

    }

});

// =============================
// LIGHTBOX ARROWS
// =============================

lightboxNext.onclick = () => {

    nextBtn.click();

};

lightboxPrev.onclick = () => {

    prevBtn.click();

};
    // =============================
// Keyboard Navigation
// =============================

document.addEventListener("keydown", (e) => {

    // Ignore key presses while typing
    if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
    ) return;

    if (e.key === "ArrowRight") {

        nextBtn.click();

    }

    if (e.key === "ArrowLeft") {

        prevBtn.click();

    }

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
    
    document.getElementById("breadcrumb-brand").textContent =
    watch.brand;

    document.getElementById("breadcrumb-model").textContent =
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
