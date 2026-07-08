/*=========================================
ADMIN PANEL NAVIGATION
=========================================*/

const menuItems = document.querySelectorAll(".sidebar-menu li");

const pages = document.querySelectorAll(".page");

const pageTitle = document.querySelector(".admin-header h1");

menuItems.forEach(item => {

    item.addEventListener("click", () => {

        // Remove active menu
        menuItems.forEach(menu => menu.classList.remove("active"));

        item.classList.add("active");

        // Hide all pages
        pages.forEach(page => {

            page.classList.remove("active-page");

            page.style.display = "none";

        });

        // Show selected page
        const target = item.dataset.page;

        const activePage = document.getElementById(target);

        if(activePage){

            activePage.style.display = "block";

            activePage.classList.add("active-page");

        }

        // Change header title
        pageTitle.textContent = item.textContent.trim();

    });

});

// Hide all pages except Dashboard
pages.forEach(page => page.style.display = "none");

document.getElementById("dashboard").style.display = "block";
