/*=========================================
CHRONOLUX ADMIN
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const menuItems = document.querySelectorAll(".sidebar-menu li");

    const pages = document.querySelectorAll(".page");

    const pageTitle = document.getElementById("page-title");

    menuItems.forEach(item => {

        item.addEventListener("click", () => {

            // Remove active state
            menuItems.forEach(menu => menu.classList.remove("active"));

            item.classList.add("active");

            // Hide all pages
            pages.forEach(page => {

                page.classList.remove("active-page");

            });

            // Show selected page
            const pageID = item.dataset.page;

            const selectedPage = document.getElementById(pageID);

            if(selectedPage){

                selectedPage.classList.add("active-page");

            }

            // Change page title
            pageTitle.textContent = item.textContent.trim();

        });

    });

});
