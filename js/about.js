document.addEventListener("DOMContentLoaded", () => {

    loadReviewSummary();

    loadFeaturedReviews();

    loadAllReviews();

});

/* =========================================
CREATE REVIEW CARD
========================================= */

function createReviewCard(review) {

    const avatarColors = [
        "#D4AF37",
        "#0F4C81",
        "#006A4E",
        "#7B1E3A",
        "#5B4B8A",
        "#8B5A2B",
        "#2E4053",
        "#556B2F"
    ];

    const color =
        avatarColors[
            review.name.length % avatarColors.length
        ];

    const initials = review.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .substring(0,2)
        .toUpperCase();

    return `

<div class="review-card">

    <div class="review-header">

        <div
            class="review-avatar"
            style="background:${color};">

            ${initials}

        </div>

        <div class="review-user">

            <h4>${review.name}</h4>

        </div>

    </div>

    <div class="review-stars">

        ${"★".repeat(review.rating)}
        ${"☆".repeat(5-review.rating)}

    </div>

    <h3 class="review-title">

        ${review.review_title || "Excellent Experience"}

    </h3>

    <p class="review-text">

        ${review.message}

    </p>

    <div class="review-footer">

        <span class="review-country">

            ${review.country}

        </span>

        <span class="review-date">

            ${review.displayDate}

        </span>

    </div>

    <button
        class="helpful-btn">

        ❤️ Helpful
        (<span class="helpful-count">

            ${review.helpful}

        </span>)

    </button>

    <div class="chronolux-reply">

        <strong>

            💬 Reply from ChronoLux

        </strong>

        <p>

            ${review.reply}

        </p>

    </div>

</div>

`;

}
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
        
        if (!container) return;
        
        container.innerHTML = "";

    reviews.forEach(review => {

        container.innerHTML += `

<div class="review-card">

    <div class="review-header">

        <div class="review-avatar">
            ${review.name.charAt(0).toUpperCase()}
        </div>

        <div class="review-user">

            <h4>${review.name}</h4>

            <span>${review.country}</span>

        </div>

    </div>

    <div class="review-stars">

        ${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}

    </div>

    <h3 class="review-title">

        ${review.review_title}

    </h3>

    <p class="review-text">

        ${review.message}

    </p>

    <div class="review-footer">
    
        <span class="review-date">
    
            ${new Date(review.created_at).toLocaleDateString("en-US",{
                day:"numeric",
                month:"long",
                year:"numeric"
            })}
    
        </span>
    
    </div>
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

    <div class="review-header">

        <div class="review-avatar">
            ${review.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
        </div>

        <div class="review-user">
            <h4>${review.name}</h4>
        </div>

    </div>

    <div class="review-stars">
        ${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}
    </div>

    <h3 class="review-title">
        ${review.review_title || "Excellent Experience"}
    </h3>

    <p class="review-text">
        ${review.message}
    </p>

    <div class="review-footer">

        <span class="review-country">
            ${review.country}
        </span>

        <span class="review-date">
            ${new Date(review.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })}
        </span>

    </div>

</div>

`;

    });

}
