// ==========================================
// CHRONOLUX ADMIN AUTHENTICATION
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("admin-login-form");
    const emailInput = document.getElementById("admin-email");
    const passwordInput = document.getElementById("admin-password");
    const button = document.getElementById("admin-login-button");
    const message = document.getElementById("admin-login-message");

    if (!form) return;

    const showMessage = (text, type = "") => {
        message.textContent = text;
        message.className = `admin-login-message ${type}`;
    };

    // If an authenticated Supabase session already exists, do not ask the admin to log in again.
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        window.location.replace("admin.html");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        showMessage("");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Enter your administrator email and password.", "error");
            return;
        }

        button.disabled = true;
        button.textContent = "Signing In...";

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error(error);
            showMessage("Unable to sign in. Check your credentials and try again.", "error");
            button.disabled = false;
            button.textContent = "Sign In";
            return;
        }

        showMessage("Authentication successful. Opening dashboard...", "success");
        window.location.replace("admin.html");
    });
});
