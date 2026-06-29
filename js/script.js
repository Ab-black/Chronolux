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
