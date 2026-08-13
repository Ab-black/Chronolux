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

    if (error || !watch) {
        console.error(error);
        return;
    }

    const { data: galleryImages, error: galleryError } = await supabaseClient
        .from("watch_images")
        .select("*")
        .eq("watch_id", watch.id)
        .order("sort_order", { ascending: true });

    if (galleryError) console.error(galleryError);

    document.title = `${watch.brand} ${watch.model} | ChronoLux`;

    const image = document.getElementById("product-image");
    const dotsContainer = document.getElementById("gallery-dots");
    const thumbContainer = document.getElementById("gallery-thumbnails");
    const prevBtn = document.getElementById("gallery-prev");
    const nextBtn = document.getElementById("gallery-next");
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxDots = document.getElementById("lightbox-dots");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    const lightboxClose = document.getElementById("lightbox-close");

    const allImages = [watch.image, ...(galleryImages || []).map(img => img.image_url)];
    let currentIndex = 0;

    function showImage(index) {
        currentIndex = index;
        image.style.opacity = "0";
        setTimeout(() => {
            image.src = allImages[currentIndex];
            lightboxImage.src = allImages[currentIndex];
            image.style.opacity = "1";
        }, 180);

        document.querySelectorAll(".gallery-dot").forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
        document.querySelectorAll(".gallery-thumb").forEach((thumb, i) => thumb.classList.toggle("active", i === currentIndex));
    }

    dotsContainer.innerHTML = "";
    thumbContainer.innerHTML = "";

    allImages.forEach((url, index) => {
        const dot = document.createElement("div");
        dot.className = "gallery-dot";
        if (index === 0) dot.classList.add("active");
        dot.onclick = () => showImage(index);
        dotsContainer.appendChild(dot);

        const thumb = document.createElement("img");
        thumb.src = url;
        thumb.className = "gallery-thumb";
        if (index === 0) thumb.classList.add("active");
        thumb.onclick = () => showImage(index);
        thumbContainer.appendChild(thumb);
    });

    prevBtn.onclick = () => showImage((currentIndex - 1 + allImages.length) % allImages.length);
    nextBtn.onclick = () => showImage((currentIndex + 1) % allImages.length);
    showImage(0);

    image.onclick = () => {
        lightbox.classList.add("show");
        lightboxImage.src = allImages[currentIndex];
    };

    lightboxClose.onclick = () => lightbox.classList.remove("show");
    lightbox.onclick = e => {
        if (e.target === lightbox || e.target.classList.contains("lightbox")) lightbox.classList.remove("show");
    };

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") lightbox.classList.remove("show");
        if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "ArrowLeft") prevBtn.click();
    });

    lightboxPrev.onclick = () => showImage((currentIndex - 1 + allImages.length) % allImages.length);
    lightboxNext.onclick = () => showImage((currentIndex + 1) % allImages.length);

    document.getElementById("product-brand").textContent = watch.brand;
    document.getElementById("product-name").textContent = watch.model;
    document.getElementById("breadcrumb-brand").textContent = watch.brand;
    document.getElementById("breadcrumb-model").textContent = watch.model;
    document.getElementById("old-price").textContent = watch.old_price;
    document.getElementById("new-price").textContent = watch.new_price;
    document.getElementById("product-description").textContent = watch.description;

    document.getElementById("product-specs").innerHTML = `
        <li><strong>Brand:</strong> ${watch.brand}</li>
        <li><strong>Model:</strong> ${watch.model}</li>
        <li><strong>Movement:</strong> ${watch.movement}</li>
        <li><strong>Case:</strong> ${watch.case_material}</li>
        <li><strong>Case Size:</strong> ${watch.case_size}</li>
        <li><strong>Water Resistance:</strong> ${watch.water_resistance}</li>
        <li><strong>Condition:</strong> ${watch.condition}</li>
    `;

    const buyButton = document.getElementById("whatsapp-btn");
    buyButton.textContent = "BUY NOW";
    buyButton.href = `checkout.html?slug=${encodeURIComponent(watch.slug)}`;
}
