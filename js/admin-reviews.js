// ==========================================
// CHRONOLUX ADMIN REVIEWS
// ==========================================

document.addEventListener("DOMContentLoaded", loadReviews);

async function loadReviews() {

    const container = document.getElementById("reviews-container");

    if (!container) return;

    container.innerHTML = "<p>Loading reviews...</p>";

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        container.innerHTML = "<p>Unable to load reviews.</p>";

        return;

    }

    if (reviews.length === 0) {

        container.innerHTML = "<p>No reviews found.</p>";

        return;

    }

    container.innerHTML = "";

    reviews.forEach(review => {

        const date = new Date(review.created_at);

        container.innerHTML += `

        <div class="review-card">

            <div class="review-top">

                <div class="review-stars">

                    ${"⭐".repeat(review.rating)}

                </div>

                <div class="review-status ${review.status}">

                    ${review.status}

                </div>

            </div>

            <div class="review-user">

                <h3>${review.name}</h3>

                <span>

                    <i class="fas fa-globe"></i>

                    ${review.country}

                </span>

            </div>

            <div class="review-message">

                "${review.message}"

            </div>

            <div class="review-date">

                <i class="fas fa-calendar"></i>

                ${date.toDateString()}

            </div>

            <div class="review-actions">

                <button
                    class="approve-btn"
                    onclick="approveReview('${review.id}')">

                    ✔ Approve

                </button>

                <button
                    class="edit-btn"
                    onclick="editReview('${review.id}')">

                    ✏ Edit

                </button>

                <button
                    class="delete-btn"
                    onclick="deleteReview('${review.id}')">

                    🗑 Delete

                </button>

            </div>

        </div>

        `;

    });

}

// ==========================================
// APPROVE REVIEW
// ==========================================

async function approveReview(id){

    const { error } = await supabaseClient

        .from("reviews")

        .update({

            status:"approved"

        })

        .eq("id",id);

    if(error){

        alert("Unable to approve review.");

        return;

    }

    loadReviews();

}

// ==========================================
// DELETE REVIEW
// ==========================================

async function deleteReview(id){

    if(!confirm("Delete this review permanently?")) return;

    const { error } = await supabaseClient

        .from("reviews")

        .delete()

        .eq("id",id);

    if(error){

        alert("Unable to delete review.");

        return;

    }

    loadReviews();

}

// ==========================================
// EDIT REVIEW
// ==========================================

function editReview(id){

    alert("Edit Review feature will be added next.");

}
