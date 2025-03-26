const baseUrl = "http://localhost:3000/stock-list-reviews"; // Replace with your backend URL

// Function to fetch reviews for a stock list
export const fetchReviews = async (stockListId) => {
  try {
    const response = await fetch(`${baseUrl}/${stockListId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch reviews.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to write a review
export const writeReview = async (stockListId, userId, comment) => {
  try {
    const response = await fetch(`${baseUrl}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stockListId, userId, comment }),
    });

    if (!response.ok) {
      throw new Error("Failed to write review.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to edit a review
export const editReview = async (reviewId, comment) => {
  console.log("EDITING REVIEW", reviewId, comment);
  try {
    const response = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      throw new Error("Failed to edit review.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Function to delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await fetch(`${baseUrl}/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete review.");
    }

    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
};
