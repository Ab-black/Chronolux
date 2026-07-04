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

