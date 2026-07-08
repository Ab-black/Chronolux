/*=========================================
WATCH DATABASE
=========================================*/


/*=========================================
LOAD PRODUCT PAGE
=========================================*/

const params = new URLSearchParams(window.location.search);
const watchID = params.get("watch");

const watch = watchDatabase.find(item => item.id === watchID);

if (watch) {


    // Page title
    document.title = watch.brand + " " + watch.model + " | ChronoLux";

    // Breadcrumb
    document.querySelector(".breadcrumb a:nth-of-type(2)").textContent = watch.brand;
    document.querySelector(".breadcrumb span").textContent = watch.model;

    // Image
    document.querySelector(".product-image img").src = watch.image;
    document.querySelector(".product-image img").alt = watch.title;

    // Brand
    document.querySelector(".product-brand").textContent = watch.brand;

    // Heading
    document.querySelector(".product-details h1").textContent = watch.model;

    // Prices
    document.querySelector(".old-price").textContent = watch.oldPrice;
    document.querySelector(".new-price").textContent = watch.newPrice;

    // Description
    document.querySelector(".product-description").textContent = watch.description;

    // Specifications
    const specList = document.querySelector(".specifications ul");
    specList.innerHTML = "";

    for (const key in watch.specs) {
        specList.innerHTML += `<li><strong>${key}:</strong> ${watch.specs[key]}</li>`;
    }

   // WhatsApp Button
const button = document.querySelector("#whatsapp-btn");

button.addEventListener("click", function (e) {

    e.preventDefault();

    const message =
`Hello ChronoLux,

I'm interested in the following watch.

Brand: ${watch.brand}
Model: ${watch.model}
Price: ${watch.newPrice}

Product Link:
https://ab-black.github.io/Chronolux/product.html?watch=${watchID}

Could you please let me know if it's still available?`;

    const whatsappURL =
`https://wa.me/2349039450751?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");

});

}
