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
REVIEW DISPLAY DATA
========================================= */

const reviewDates = [

    // 2026 — 6 reviews
    "January 14, 2026",
    "March 27, 2026",
    "May 9, 2026",
    "June 18, 2026",
    "July 6, 2026",
    "August 2, 2026",

    // 2025 — 11 reviews
    "January 22, 2025",
    "February 16, 2025",
    "April 8, 2025",
    "May 21, 2025",
    "June 13, 2025",
    "July 29, 2025",
    "September 5, 2025",
    "October 17, 2025",
    "November 3, 2025",
    "November 24, 2025",
    "December 15, 2025",

    // 2024 — 8 reviews
    "January 11, 2024",
    "March 4, 2024",
    "April 19, 2024",
    "June 7, 2024",
    "July 23, 2024",
    "September 14, 2024",
    "October 28, 2024",
    "December 9, 2024",

    // 2023 — 9 reviews
    "February 3, 2023",
    "March 18, 2023",
    "May 6, 2023",
    "June 24, 2023",
    "August 12, 2023",
    "September 29, 2023",
    "October 16, 2023",
    "November 8, 2023",
    "December 21, 2023",

    // 2022 — 7 reviews
    "January 26, 2022",
    "April 13, 2022",
    "May 30, 2022",
    "July 17, 2022",
    "September 6, 2022",
    "October 22, 2022",
    "December 4, 2022",

    // 2021 — 6 reviews
    "February 9, 2021",
    "April 25, 2021",
    "June 11, 2021",
    "August 28, 2021",
    "October 15, 2021",
    "December 19, 2021"

];


/* =========================================
HELPFUL COUNTS
========================================= */

const helpfulCounts = [
    12, 8, 17, 6, 21, 9, 14, 5,
    18, 7, 11, 24, 15, 4, 19, 10,
    13, 8, 16, 22, 6, 14, 9, 17,
    5, 12, 20, 7, 15, 11, 18, 4,
    9, 16, 23, 6, 13, 8, 19, 10,
    14, 5, 21, 7, 12, 17, 9
];


/* =========================================
CHRONOLUX REPLIES
========================================= */

const chronoluxReplies = [

    "Thank you for choosing ChronoLux. We are delighted to have been part of your luxury watch experience.",

    "Thank you for your kind words and for trusting ChronoLux with your purchase.",

    "We truly appreciate your feedback. It was our pleasure assisting you throughout your purchase.",

    "Thank you for being part of the ChronoLux family. We are delighted that you enjoyed your experience.",

    "Your trust means a great deal to us. Thank you for taking the time to share your experience.",

    "We are pleased to hear that your experience met your expectations. Thank you for choosing ChronoLux.",

    "Thank you for sharing your experience with fellow collectors. We sincerely appreciate your trust.",

    "It was a pleasure serving you. We hope you continue to enjoy your exceptional timepiece.",

    "Thank you for your confidence in ChronoLux. We look forward to serving you again in the future.",

    "We appreciate your review and are delighted that you had a smooth and enjoyable experience with ChronoLux.",

    "Thank you for allowing ChronoLux to be part of your collection. We truly value your support.",

    "We are delighted to hear that you were satisfied with your ChronoLux experience. Thank you for your trust."

];


/* =========================================
PREPARE REVIEW FOR DISPLAY
========================================= */

function prepareReview(review, index) {

    return {

        ...review,

        displayDate:
            reviewDates[index % reviewDates.length],

        helpful:
            helpfulCounts[index % helpfulCounts.length],

        reply:
            chronoluxReplies[index % chronoluxReplies.length]

    };

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
