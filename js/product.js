/*=========================================
WATCH DATABASE
=========================================*/

const watches = {

    daytona: {

        title: "Rolex Cosmograph Daytona",

        brand: "Rolex",

        model: "Cosmograph Daytona",

        image: "images/watches/rolex/cosmograph-daytona.jpg",

        oldPrice: "$19,500.00",

        newPrice: "$18,500.00",

        description:
            "The Rolex Cosmograph Daytona is one of the world's most iconic luxury chronographs. Built for racing, admired by collectors, and celebrated for exceptional craftsmanship.",

        specs: {
            Brand: "Rolex",
            Model: "Cosmograph Daytona",
            Movement: "Automatic",
            Case: "Oystersteel",
            "Case Size": "40mm",
            "Water Resistance": "100m",
            Condition: "Brand New"
        }

    },

    nautilus: {

        title: "Patek Philippe Nautilus 5711",

        brand: "Patek Philippe",

        model: "Nautilus 5711",

        image: "images/watches/patek-philippe/nautilus.jpg",

        oldPrice: "$129,500.00",

        newPrice: "$125,500.00",

        description:
            "The Patek Philippe Nautilus 5711 is one of the world's most sought-after luxury sports watches, admired for its iconic design and Swiss craftsmanship.",

        specs: {
            Brand: "Patek Philippe",
            Model: "Nautilus 5711",
            Movement: "Automatic",
            Case: "Stainless Steel",
            "Case Size": "40mm",
            "Water Resistance": "120m",
            Condition: "Brand New"
        }

    },

    rm11: {

        title: "Richard Mille RM 11-03",

        brand: "Richard Mille",

        model: "RM 11-03",

        image: "images/watches/richard-mille/rm11-03.jpg",

        oldPrice: "$302,000.00",

        newPrice: "$299,000.00",

        description:
            "The Richard Mille RM 11-03 combines cutting-edge engineering with a bold modern design, making it one of the world's most recognizable luxury watches.",

        specs: {
            Brand: "Richard Mille",
            Model: "RM 11-03",
            Movement: "Automatic Flyback Chronograph",
            Case: "Carbon TPT",
            "Case Size": "50mm",
            "Water Resistance": "50m",
            Condition: "Brand New"
        }

    }

};
/*=========================================
LOAD PRODUCT PAGE
=========================================*/

const params = new URLSearchParams(window.location.search);
const watchID = params.get("watch");

if (watchID && watches[watchID]) {

    const watch = watches[watchID];

    // Page title
    document.title = watch.title + " | ChronoLux";

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
