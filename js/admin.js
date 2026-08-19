/*=========================================
CHRONOLUX ADMIN
=========================================*/

document.addEventListener("DOMContentLoaded", async () => {

    // Require both a valid Supabase Auth session and an active admin allowlist entry.
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();

    if (sessionError || !session) {
        window.location.replace("admin-login.html");
        return;
    }

    const { data: adminUser, error: adminError } = await supabaseClient
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .eq("active", true)
        .maybeSingle();

    if (adminError || !adminUser) {
        await supabaseClient.auth.signOut();
        window.location.replace("admin-login.html");
        return;
    }

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

            if (selectedPage) {

                selectedPage.classList.add("active-page");

            }

            // Change page title
            if (pageTitle) {
                pageTitle.textContent = item.textContent.trim();
            }

        });

    });

    // Sign out through Supabase instead of simply navigating to the login page.
    const logoutLink = document.querySelector('.sidebar-footer a[href="admin-login.html"]');

    if (logoutLink) {
        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();

            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                console.error(error);
                return;
            }

            window.location.replace("admin-login.html");
        });
    }

    /*=========================================
    WATCH FORM
    =========================================*/

    const watchForm = document.getElementById("watch-form");

    if (watchForm) {

        watchForm.addEventListener("submit", saveWatch);

    }

});
