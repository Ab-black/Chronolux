document.addEventListener("DOMContentLoaded", () => {

    loadReviewSummary();

    loadFeaturedReviews();

    loadAllReviews();

});

/* =========================================
LOAD REVIEW SUMMARY
========================================= */

async function loadReviewSummary() {

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .eq("status", "Approved");

    if (error) {
        console.error(error);
        return;
    }

    if (!reviews.length) return;

    let total = reviews.length;

    let totalStars = 0;

    let counts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    reviews.forEach(review => {

        totalStars += review.rating;

        counts[review.rating]++;

    });

    const average = (totalStars / total).toFixed(1);

    document.getElementById("overall-rating").textContent = average;

    document.getElementById("total-reviews").textContent = total;

    document.querySelector(".five-star").style.width =
        (counts[5] / total * 100) + "%";

    document.querySelector(".four-star").style.width =
        (counts[4] / total * 100) + "%";

    document.querySelector(".three-star").style.width =
        (counts[3] / total * 100) + "%";

    document.querySelector(".two-star").style.width =
        (counts[2] / total * 100) + "%";

    document.querySelector(".one-star").style.width =
        (counts[1] / total * 100) + "%";

}



/* =========================================
LOAD FEATURED REVIEWS
========================================= */

async function loadFeaturedReviews() {

    const { data: reviews, error } = await supabaseClient

        .from("reviews")

        .select("*")

        .eq("status", "Approved")

        .order("created_at", { ascending: false })

        .limit(8);

    if (error) {

        console.error(error);

        return;

    }

    const container = document.getElementById("reviews-grid");

    container.innerHTML = "";

    reviews.forEach(review => {

        container.innerHTML += `

        <div class="review-card">

            <div class="review-stars">

                ${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}

            </div>

            <p>${review.message}</p>

            <h4>${review.name}</h4>

            <span>${review.country}</span>

        </div>

        `;

    });

}
/* =========================================
LOAD ALL REVIEWS PAGE
========================================= */

async function loadAllReviews() {

    const container = document.getElementById("all-reviews-grid");

    if (!container) return;

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .eq("status", "Approved")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        container.innerHTML = "<p>Unable to load reviews.</p>";

        return;

    }

    if (!reviews.length) {

        container.innerHTML = "<p>No reviews available.</p>";

        return;

    }

    container.innerHTML = "";

    reviews.forEach(review => {

        container.innerHTML += `

        <div class="review-card">

            <div class="review-stars">

                ${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}

            </div>

            <p>${review.message}</p>

            <h4>${review.name}</h4>

            <span>${review.country}</span>

        </div>

        `;

    });

}
