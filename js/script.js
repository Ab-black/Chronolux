// ===============================
// CHRONOLUX SCRIPT
// PART 1
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

// Scroll-to-top Button
const scrollTop = document.querySelector(".scroll-top");

if (scrollTop) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 500) {

            scrollTop.classList.add("active");

        } else {

            scrollTop.classList.remove("active");

        }

    });

    scrollTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});
// ===============================
// CHRONOLUX SCRIPT
// PART 2
// ===============================

// Mobile Menu Toggle
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("active");
        menuBtn.classList.toggle("active");
    });

    // Close menu when link is clicked (mobile UX improvement)
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
            menuBtn.classList.remove("active");
        });
    });
}

// Reveal Elements on Scroll (Scroll Animation Effect)
const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
    const windowHeight = window.innerHeight;

    revealElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
            el.classList.add("active");
        }
    });
}

window.addEventListener("scroll", revealOnScroll);

// Run once on load
revealOnScroll();


// Active Nav Link Highlight on Scroll
const sections = document.querySelectorAll("section");
const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.scrollY >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    navItems.forEach(link => {
        link.classList.remove("active");

        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }
    });
});
/*==============================
MOBILE MENU
==============================*/

const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-menu");

menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("show-menu");

});
document.querySelectorAll(".nav-menu a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("show-menu");

    });

});
