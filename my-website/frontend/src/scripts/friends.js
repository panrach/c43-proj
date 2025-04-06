const baseUrl = "http://localhost:3000";

// Send a friend request
export const sendFriendRequest = async (userEmail, friendEmail) => {
  try {
    const response = await fetch(`${baseUrl}/friends/send-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail, friendEmail }),
    });
    if (!response.ok) {
      throw new Error("Failed to send friend request");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    alert("Error sending friend request");
    console.error("Error sending friend request:", error);
  }
};

// Accept a friend request
export const acceptFriendRequest = async (userEmail, friendEmail) => {
  try {
    const response = await fetch(`${baseUrl}/friends/accept-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail, friendEmail }),
    });
    if (!response.ok) {
      throw new Error("Failed to accept friend request");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
};

// View friends
export const viewFriends = async (userEmail) => {
  try {
    const response = await fetch(`${baseUrl}/friends/view/${userEmail}`);
    if (!response.ok) {
      throw new Error("Failed to view friends");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error viewing friends:", error);
  }
};

// View friend requests
export const viewFriendRequests = async (userEmail) => {
  try {
    const response = await fetch(`${baseUrl}/friends/requests/${userEmail}`);
    if (!response.ok) {
      throw new Error("Failed to view friend requests");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error viewing friend requests:", error);
  }
};

// Delete a friend
export const deleteFriend = async (userEmail, friendEmail) => {
  try {
    const response = await fetch(`${baseUrl}/friends/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userEmail, friendEmail }),
    });
    if (!response.ok) {
      throw new Error("Failed to delete friend");
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting friend:", error);
  }
};