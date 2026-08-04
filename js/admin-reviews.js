// ==========================================
// LOAD CUSTOMER REVIEWS
// ==========================================

document.addEventListener("DOMContentLoaded", loadReviews);

async function loadReviews() {

    const table = document.getElementById("reviews-table");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="5">Loading reviews...</td>
        </tr>
    `;

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load reviews.
                </td>
            </tr>
        `;

        return;

    }

    table.innerHTML = "";

    reviews.forEach(review => {

        table.innerHTML += `

        <tr>

            <td>${review.name}</td>

            <td>${review.country}</td>

            <td>${"⭐".repeat(review.rating)}</td>

            <td>

                <span class="status ${review.status}">

                    ${review.status}

                </span>

            </td>

            <td>

                <button
                    class="icon-btn approve-btn"
                    data-id="${review.id}">

                    <i class="fas fa-check"></i>

                </button>

                <button
                    class="icon-btn delete delete-btn"
                    data-id="${review.id}">

                    <i class="fas fa-trash"></i>

                </button>

            </td>

        </tr>

        `;

    });

}
