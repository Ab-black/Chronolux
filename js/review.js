document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("review-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("review-name").value.trim();
        const email = document.getElementById("review-email").value.trim();
        const country = document.getElementById("review-country").value.trim();
        const rating = parseInt(document.getElementById("review-rating").value);
        const message = document.getElementById("review-message").value.trim();

        const { error } = await supabaseClient
            .from("reviews")
            .insert([
                {
                    name,
                    email,
                    country,
                    rating,
                    message,
                    status: "pending"
                }
            ]);

        if (error) {

            alert("Unable to submit your review.");

            console.error(error);

            return;

        }

        alert("Thank you! Your review has been submitted for approval.");

        form.reset();

    });

});
