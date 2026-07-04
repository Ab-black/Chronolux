// ===============================
// CHRONOLUX SCRIPT
// ===============================

// Sticky Header
const header = document.querySelector(".header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});

// Mobile Menu
const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-menu");
const menuIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("show-menu");

    menuIcon.classList.toggle("fa-bars");
    menuIcon.classList.toggle("fa-times");
});

document.querySelectorAll(".nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("show-menu");
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
    });
});
/*=================================
WHATSAPP REQUEST BUTTONS
=================================*/

const whatsappNumber = "2349039450751";

document.querySelectorAll(".watch-btn").forEach(button => {

    button.addEventListener("click", function(e){

        e.preventDefault();

        const brand = this.dataset.brand;
        const model = this.dataset.model;
        const price = this.dataset.price;
        const link = this.dataset.link;

        const message =
`Hello ChronoLux,

I'm interested in purchasing the following watch.

Brand: ${brand}
Model: ${model}
Price: ${price}

Product Link:
${link}

Could you please let me know if it's still available?`;

        const whatsappURL =
`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL,"_blank");

    });

});
/*=========================================
PRODUCT PAGE DATA
=========================================*/

const watches = {

    daytona: {

        brand: "Rolex",

        name: "Cosmograph Daytona",

        oldPrice: "$18,500.00",

        newPrice: "$19,500.00",

        image: "images/watches/rolex/cosmograph-daytona.jpg",

        description:
        "The Rolex Cosmograph Daytona is one of the world's most iconic luxury chronographs. Built for racing, admired by collectors, and celebrated for its exceptional craftsmanship.",

        specs: [

            ["Brand","Rolex"],

            ["Model","Cosmograph Daytona"],

            ["Movement","Automatic"],

            ["Case","Oystersteel"],

            ["Case Size","40 mm"],

            ["Water Resistance","100 m"],

            ["Condition","Brand New"]

        ]

    },

    nautilus: {

        brand: "Patek Philippe",

        name: "Nautilus 5711",

        oldPrice: "$129,500.00",

        newPrice: "$125,500.00",

        image: "images/watches/patek-philippe/nautilus.jpg",

        description:
        "The Patek Philippe Nautilus 5711 is one of the most sought-after luxury sports watches, admired for its elegant design, rarity and exceptional finishing.",

        specs: [

            ["Brand","Patek Philippe"],

            ["Model","Nautilus 5711"],

            ["Movement","Automatic"],

            ["Case","Stainless Steel"],

            ["Case Size","40 mm"],

            ["Water Resistance","120 m"],

            ["Condition","Brand New"]

        ]

    },

    rm11: {

        brand: "Richard Mille",

        name: "RM 11-03",

        oldPrice: "$302,000.00",

        newPrice: "$299,000.00",

        image: "images/watches/richard-mille/rm11-03.jpg",

        description:
        "The Richard Mille RM 11-03 combines cutting-edge engineering with an unmistakable tonneau case, making it one of the most recognizable luxury sports watches.",

        specs: [

            ["Brand","Richard Mille"],

            ["Model","RM 11-03"],

            ["Movement","Automatic Flyback Chronograph"],

            ["Case","Carbon TPT"],

            ["Case Size","49.94 mm"],

            ["Water Resistance","50 m"],

            ["Condition","Brand New"]

        ]

    }

};
/*====================================================
PRODUCT PAGE DATA
====================================================*/

const watches = {

    daytona: {

        brand: "Rolex",

        model: "Cosmograph Daytona",

        oldPrice: "$18,500.00",

        newPrice: "$19,500.00",

        image: "images/watches/rolex/cosmograph-daytona.jpg",

        description:
        "The Rolex Cosmograph Daytona is one of the world's most iconic luxury chronographs. Built for racing, admired by collectors, and celebrated for its exceptional craftsmanship.",

        specs: {
            Movement: "Automatic",
            Case: "Oystersteel",
            Size: "40 mm",
            Water: "100 m",
            Condition: "Brand New"
        }

    },

    nautilus: {

        brand: "Patek Philippe",

        model: "Nautilus 5711",

        oldPrice: "$125,500.00",

        newPrice: "$129,500.00",

        image: "images/watches/patek-philippe/nautilus.jpg",

        description:
        "The Patek Philippe Nautilus 5711 is one of the most sought-after luxury sports watches, admired for its iconic design and extraordinary craftsmanship.",

        specs: {
            Movement: "Automatic",
            Case: "Stainless Steel",
            Size: "40 mm",
            Water: "120 m",
            Condition: "Brand New"
        }

    },

    rm11: {

        brand: "Richard Mille",

        model: "RM 11-03",

        oldPrice: "$299,000.00",

        newPrice: "$302,000.00",

        image: "images/watches/richard-mille/rm11-03.jpg",

        description:
        "The Richard Mille RM 11-03 combines cutting-edge engineering with avant-garde design, making it one of the most prestigious modern timepieces.",

        specs: {
            Movement: "Automatic Flyback Chronograph",
            Case: "Carbon TPT",
            Size: "49.9 mm",
            Water: "50 m",
            Condition: "Brand New"
        }

    }

};
/*=========================================
PRODUCT PAGE DATA
=========================================*/

const watches = {

    daytona: {

        title: "Rolex Cosmograph Daytona",

        brand: "Rolex",

        model: "Cosmograph Daytona",

        image: "images/watches/rolex/cosmograph-daytona.jpg",

        oldPrice: "$18,500.00",

        newPrice: "$19,500.00",

        description:
            "The Rolex Cosmograph Daytona is one of the world's most iconic luxury chronographs. Built for racing, admired by collectors and celebrated for exceptional craftsmanship.",

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

        oldPrice: "$125,500.00",

        newPrice: "$129,500.00",

        description:
            "The Patek Philippe Nautilus 5711 combines timeless elegance with exceptional Swiss craftsmanship and remains one of the world's most sought-after luxury sports watches.",

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

        oldPrice: "$299,000.00",

        newPrice: "$302,000.00",

        description:
            "The Richard Mille RM 11-03 is an ultra-modern luxury sports watch featuring advanced engineering, lightweight construction and unmistakable design.",

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

        specList.innerHTML += `
            <li><strong>${key}:</strong> ${watch.specs[key]}</li>
        `;

    }

    // WhatsApp Button
    const button = document.querySelector(".watch-btn");

    button.href =
        `https://wa.me/2349039450751?text=Hello ChronoLux,%20I'm interested in the ${watch.brand} ${watch.model}.%0A%0AProduct Link:%20https://ab-black.github.io/Chronolux/product.html?watch=${watchID}`;

}
