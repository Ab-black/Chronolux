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

/*==============================
MOBILE MENU
==============================*/
/*==============================
RESPONSIVE NAVIGATION
==============================*/

const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-menu");
const menuIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {
    navMenu.classList.toggle("show-menu");

    if (navMenu.classList.contains("show-menu")) {
        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-times");
    } else {
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
    }
});

document.querySelectorAll(".nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("show-menu");
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
    });
});
/*==============================
RESPONSIVE NAVIGATION
==============================*/

const menuBtn = document.querySelector(".menu-btn");
const navMenu = document.querySelector(".nav-menu");
const menuIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("show-menu");

    if(navMenu.classList.contains("show-menu")){
        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-times");
    }else{
        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");
    }

});

document.querySelectorAll(".nav-menu a").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("show-menu");

        menuIcon.classList.remove("fa-times");
        menuIcon.classList.add("fa-bars");

    });

});
