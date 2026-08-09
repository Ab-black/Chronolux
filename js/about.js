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
        "#5B4B8A",
        "#2E4053",
        "#7B1E3A",
        "#006A4E",
        "#8B5A2B",
        "#556B2F",
        "#6B4F8A"
    ];

    const color =
        avatarColors[
            review.name.length % avatarColors.length
        ];

    const initials = review.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    return `

<div class="review-card">

    <!-- REVIEW HEADER -->

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


    <!-- STARS -->

    <div class="review-stars">

    ${Array.from({ length: 5 }, (_, i) => `
    <span class="star ${i < review.rating ? "star-selected" : "star-empty"}">
        ${i < review.rating ? "★" : "☆"}
    </span>
`).join("")}

</div>


    <!-- REVIEW MESSAGE -->

    <p class="review-text">

        ${review.message}

    </p>


    <!-- HELPFUL -->

    <div class="helpful-wrapper">

        <button
            type="button"
            class="helpful-btn"
            data-review-id="${review.id}">

            <span class="helpful-heart">♡</span>

            <span class="helpful-count">
                ${review.helpful}
            </span>

            <span class="helpful-label">
                ${review.helpful === 1
                    ? "person found this helpful"
                    : "persons found this helpful"}
            </span>

        </button>

    </div>


    <!-- COUNTRY + DATE -->

    <div class="review-footer">

        <span class="review-country">

            ${review.country}

        </span>

        <span class="review-date">

            ${review.displayDate}

        </span>

    </div>


    <!-- CHRONOLUX REPLY -->

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
PREPARE REVIEW FOR DISPLAY
========================================= */

function prepareReview(review, index) {

    const replies = [
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

    const reviewDate = review.created_at
        ? new Date(review.created_at)
        : null;

    const year = reviewDate
        ? reviewDate.getFullYear()
        : null;

    const month = reviewDate
        ? reviewDate.getMonth()
        : null;

    /*
     * GET THE CURRENT HELPFUL COUNT
     */
    let helpfulCount =
        Number(review.helpful_count) || 0;

    /*
     * 2026 REVIEWS
     * Maximum starting count = 7
     */
    if (year === 2026) {

        helpfulCount =
            Math.min(helpfulCount, 7);

        /*
         * AUGUST 2026
         * Starting count can only be 0 or 1
         */
        if (month === 7) {

            helpfulCount =
                helpfulCount > 0 ? 1 : 0;

        }

    }

    return {

        ...review,

        displayDate:
            reviewDate
                ? reviewDate.toLocaleDateString(
                    "en-US",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )
                : "",

        helpful:
            helpfulCount,

        reply:
            review.chronolux_reply ||
            replies[index % replies.length]

    };

}

/* =========================================
GET VISITOR ID
========================================= */

function getChronoLuxVoterId() {

    const key = "chronolux-voter-id";

    let voterId = localStorage.getItem(key);

    if (!voterId) {

        voterId =
            "visitor-" +
            crypto.randomUUID();

        localStorage.setItem(
            key,
            voterId
        );

    }

    return voterId;

}


/* =========================================
CHECK WHETHER THIS VISITOR
FOUND A REVIEW HELPFUL
========================================= */

async function hasHelpfulVote(reviewId) {

    const voterId =
        getChronoLuxVoterId();

    const { data, error } =
        await supabaseClient
            .from("review_helpful_votes")
            .select("review_id")
            .eq("review_id", reviewId)
            .eq("voter_id", voterId)
            .maybeSingle();

    if (error) {

        console.error(
            "Unable to check helpful vote:",
            error
        );

        return false;

    }

    return !!data;

}


/* =========================================
LOAD REVIEW SUMMARY
========================================= */

async function loadReviewSummary() {

    const { data: reviews, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("status", "Approved");

    if (error) {

        console.error(
            "Error loading review summary:",
            error
        );

        return;

    }

    if (!reviews || !reviews.length)
        return;

    const total =
        reviews.length;

    let totalStars = 0;

    const counts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    reviews.forEach(review => {

        const rating =
            Number(review.rating);

        if (rating >= 1 && rating <= 5) {

            totalStars += rating;

            counts[rating]++;

        }

    });

    const average =
        (totalStars / total).toFixed(1);

    const overallRating =
        document.getElementById(
            "overall-rating"
        );

    const totalReviews =
        document.getElementById(
            "total-reviews"
        );

    if (overallRating) {

        overallRating.textContent =
            average;

    }

    if (totalReviews) {

        totalReviews.textContent =
            total;

    }

    const starBars = {
        5: ".five-star",
        4: ".four-star",
        3: ".three-star",
        2: ".two-star",
        1: ".one-star"
    };

    Object.keys(starBars).forEach(star => {

        const bar =
            document.querySelector(
                starBars[star]
            );

        if (bar) {

            bar.style.width =
                (counts[star] / total * 100) +
                "%";

        }

    });

}


/* =========================================
LOAD FEATURED REVIEWS
========================================= */

async function loadFeaturedReviews() {

    const container =
        document.getElementById(
            "reviews-grid"
        );

    if (!container)
        return;

    const { data: reviews, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("status", "Approved")
            .order("created_at", {
                ascending: false
            })
            .limit(8);

    if (error) {

        console.error(
            "Error loading featured reviews:",
            error
        );

        container.innerHTML =
            "<p>Unable to load reviews.</p>";

        return;

    }

    if (!reviews || !reviews.length) {

        container.innerHTML =
            "<p>No reviews available.</p>";

        return;

    }

    container.innerHTML = "";

    for (const review of reviews) {

        const preparedReview =
        prepareReview(review, reviews.indexOf(review));

        container.innerHTML +=
            createReviewCard(
                preparedReview
            );

    }

    await restoreHelpfulStates(
        container
    );

}


/* =========================================
LOAD ALL REVIEWS PAGE
========================================= */

async function loadAllReviews() {

    const container =
        document.getElementById(
            "all-reviews-grid"
        );

    if (!container)
        return;

    const { data: reviews, error } =
        await supabaseClient
            .from("reviews")
            .select("*")
            .eq("status", "Approved")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error(
            "Error loading all reviews:",
            error
        );

        container.innerHTML =
            "<p>Unable to load reviews.</p>";

        return;

    }

    if (!reviews || !reviews.length) {

        container.innerHTML =
            "<p>No reviews available.</p>";

        return;

    }

    container.innerHTML = "";

    for (const review of reviews) {

        const preparedReview =
        prepareReview(review, reviews.indexOf(review));
        
        container.innerHTML +=
            createReviewCard(
                preparedReview
            );

    }

    await restoreHelpfulStates(
        container
    );

}


/* =========================================
RESTORE HELPFUL STATES
========================================= */

async function restoreHelpfulStates(
    container
) {

    const buttons =
        container.querySelectorAll(
            ".helpful-btn"
        );

    for (const button of buttons) {

        const reviewId =
            button.dataset.reviewId;

        if (!reviewId)
            continue;

        const voted =
            await hasHelpfulVote(
                reviewId
            );

        if (voted) {

            button.classList.add(
                "helpful-active"
            );

        }

    }

}


/* =========================================
HELPFUL BUTTON
GLOBAL SUPABASE TOGGLE
========================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".helpful-btn"
            );

        if (!button)
            return;

        if (
            button.dataset.loading === "true"
        ) {

            return;

        }

        const reviewId =
            button.dataset.reviewId;

        if (!reviewId)
            return;

        button.dataset.loading =
            "true";

        const countElement =
            button.querySelector(
                ".helpful-count"
            );

        const labelElement =
            button.querySelector(
                ".helpful-label"
            );

        const heartElement =
            button.querySelector(
                ".helpful-heart"
            );

        try {

            const voterId =
                getChronoLuxVoterId();

            const { data, error } =
                await supabaseClient.rpc(
                    "toggle_review_helpful",
                    {
                        p_review_id:
                            Number(reviewId),

                        p_voter_id:
                            voterId
                    }
                );

            if (error)
                throw error;

            if (!data)
                throw new Error(
                    "No response from Supabase."
                );

            const helpful =
                Boolean(data.helpful);

            const newCount =
                Number(data.helpful_count) || 0;
            
            if (countElement) {

                countElement.textContent =
                    newCount;

            }

            if (labelElement) {

                labelElement.textContent =
                    newCount === 1
                        ? "person found this helpful"
                        : "persons found this helpful";

            }

            if (helpful) {

                button.classList.add(
                    "helpful-active"
                );

            } else {

                button.classList.remove(
                    "helpful-active"
                );

            }

            if (heartElement) {

    heartElement.textContent =
        helpful
            ? "♥"
            : "♡";

}

if (helpful) {

    button.classList.add(
        "helpful-active"
    );

} else {

    button.classList.remove(
        "helpful-active"
    );

}

        } catch (error) {

            console.error(
                "Helpful button error:",
                error
            );

        } finally {

            button.dataset.loading =
                "false";

        }

    }
);

