const baseUrl = "http://localhost:3000/stock-list";

// Fetch all stock lists for a user
export const fetchStockLists = async (userId) => {
  try {
    const response = await fetch(`${baseUrl}/view/${userId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch stock lists");
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching stock lists:", err);
    return [];
  }
};

// Create a new stock list
export const createStockList = async (userId, name, stocks) => {
  try {
    const response = await fetch(`${baseUrl}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, stocks }),
    });
    if (!response.ok) {
      throw new Error("Failed to create stock list");
    }
    return await response.json();
  } catch (err) {
    console.error("Error creating stock list:", err);
  }
};

// Share a stock list with a friend
export const shareStockList = async (listId, friendEmail, userId) => {
  try {
    const response = await fetch(`${baseUrl}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, friendEmail, userId }),
    });
    if (!response.ok) {
      throw new Error("Failed to share stock list");
    }
    return await response.json();
  } catch (err) {
    console.error("Error sharing stock list:", err);
  }
};

// Make a stock list public
export const makeStockListPublic = async (listId) => {
  console.log("listId being set to public: ", listId); // Debugging log
  try {
    const response = await fetch(`${baseUrl}/make-public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId }),
    });
    if (!response.ok) {
      throw new Error("Failed to make stock list public");
    }
    return await response.json();
  } catch (err) {
    console.error("Error making stock list public:", err);
  }
};

// Add a stock to a stock list
export const addStockToList = async (listId, stockCode) => {
  try {
    const response = await fetch(`${baseUrl}/add-stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, stockCode }),
    });
    if (!response.ok) {
      throw new Error("Failed to add stock to list");
    }
    return await response.json();
  } catch (err) {
    console.error("Error adding stock to list:", err);
  }
};

// Delete a stock from a stock list
export const deleteStockFromList = async (listId, stockCode) => {
  try {
    const response = await fetch(`${baseUrl}/delete-stock/${listId}/${stockCode}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete stock from list");
    }
    return await response.json();
  } catch (err) {
    console.error("Error deleting stock from list:", err);
  }
};

// Delete an entire stock list
export const deleteStockList = async (listId) => {
  try {
    const response = await fetch(`${baseUrl}/delete-list/${listId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete stock list");
    }
    return await response.json();
  } catch (err) {
    console.error("Error deleting stock list:", err);
  }
};

export const getOwner = async (listId) => {
  try {
    const response = await fetch(`${baseUrl}/owner/${listId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to get stock list owner");
    }
    return await response.json();
  } catch (err) {
    console.error("Error getting stock list owner:", err);
  }
}