import {
  checkAuthStatus,
  registerUser,
  loginUser,
  logoutUser,
} from "./auth.js";
import {
  fetchPortfolios,
  createPortfolio,
  depositCash,
  withdrawCash,
  fetchUserCash,
} from "./portfolio.js";
import { displayStatistics } from "./statistics.js";
import {
  fetchStocks,
  addStock,
  searchStocks,
  addDailyStock,
  sellStock,
} from "./stocks.js";

import {
  sendFriendRequest,
  acceptFriendRequest,
  viewFriends,
  deleteFriend,
  viewFriendRequests,
} from "./friends.js";

import {
  fetchStockLists,
  createStockList,
  shareStockList,
  makeStockListPublic,
  addStockToList,
  deleteStockFromList,
  deleteStockList,
} from "./stockList.js";

const baseUrl = "http://localhost:3000";

export const handlePortfolioClick = (portfolioId, portfolioElement) => {
  const stockSection = portfolioElement.querySelector(".stock-section");
  const stockList = portfolioElement.querySelector(".stock-list");

  if (stockSection.style.display === "none") {
    stockSection.style.display = "block";
    fetchStocks(portfolioId, stockList);
    displayStatistics(portfolioId);
  } else {
    stockSection.style.display = "none";
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const authStatus = document.getElementById("auth-status");
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");
  const logoutButton = document.getElementById("logout-button");
  const formContainers = document.getElementsByClassName("form-container");
  const createPortfolioForm = document.getElementById("create-portfolio-form");
  const portfolioList = document.getElementById("portfolio-list");
  const depositForm = document.getElementById("deposit-form");
  const withdrawForm = document.getElementById("withdraw-form");
  const cash = document.getElementById("cash-management");
  const cashBalanceElement = document.getElementById("cash-balance");
  const stockSearchInput = document.getElementById("stock-search");
  const stockSearchResults = document.getElementById("stock-search-results");
  const addStockForm = document.getElementById("add-stock-form");
  const stockSection = document.getElementById("stock-section");
  const portfolioSection = document.getElementById("portfolio-section");
  const portfolioSelect = document.getElementById("portfolio-select");
  const addDailyStockForm = document.getElementById("add-daily-stock-section");
  const portfolioDetails = document.getElementById("portfolio-details");
  const stats = document.getElementById("statistics-section");
  const add_stock = document.getElementById("add-stock-section");

  const friendSection = document.getElementById("friends-section");
  const sendRequestButton = document.getElementById("send-request-button");
  const viewFriendRequestsButton = document.getElementById(
    "view-requests-button"
  );
  const viewFriendsButton = document.getElementById("view-friends-button");
  const friendEmailInput = document.getElementById("friend-email-input");
  const friendsList = document.getElementById("friends-list");
  const friendRequestsList = document.getElementById("friend-requests-list");

  const stockListSection = document.getElementById("stock-list-section");
  const userStockLists = document.getElementById("user-stock-lists");
  const createStockListForm = document.getElementById("create-stock-list-form");
  const stockListNameInput = document.getElementById("stock-list-name");
  const stockListDropdown = document.getElementById("stock-list-dropdown");
  const shareStockListButton = document.getElementById("share-stock-list");
  const makePublicButton = document.getElementById("make-stock-list-public");
  const deleteStockListButton = document.getElementById("delete-stock-list");

  let userId = null; // Define userId variable

  const logSessionCookie = () => {
    console.log("Session Cookie:", document.cookie);
  };

  const updatePortfolioDropdown = async (userId) => {
    const response = await fetch(`${baseUrl}/portfolio/user/${userId}`, {
      credentials: "include", // Include credentials for session handling
    });
    const portfolios = await response.json();
    portfolioSelect.innerHTML =
      '<option value="" disabled selected>Select Portfolio</option>';
    portfolios.forEach((portfolio) => {
      const option = document.createElement("option");
      option.value = portfolio.id;
      option.textContent = portfolio.name;
      portfolioSelect.appendChild(option);
    });
  };

  const loadStockLists = async () => {
    const stockLists = await fetchStockLists(userId);

    stockListDropdown.innerHTML = "";
    userStockLists.innerHTML = "";

    stockLists.forEach((list) => {
      const li = document.createElement("li");
      li.textContent = list.name;
      userStockLists.appendChild(li);

      const option = document.createElement("option");
      option.value = list.id;
      option.textContent = list.name;
      stockListDropdown.appendChild(option);
    });
  };

  createStockListForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createStockList(userId, stockListNameInput.value);
    stockListNameInput.value = "";
    loadStockLists();
  });

  shareStockListButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    await shareStockList(userId, listId);
  });

  makePublicButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    await makeStockListPublic(userId, listId);
  });

  deleteStockListButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    await deleteStockList(userId, listId);
    loadStockLists();
  });

  stockSearchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query.length > 0) {
      searchStocks(query, stockSearchResults);
    } else {
      stockSearchResults.innerHTML = "";
    }
  });

  addStockForm.addEventListener("submit", (e) => addStock(e, fetchStocks));

  const loadHomepage = async (username, id) => {
    userId = id;
    authStatus.textContent = `Welcome, ${username}`;
    for (let container of formContainers) {
      container.style.display = "none";
    }
    registerForm.style.display = "none";
    loginForm.style.display = "none";
    logoutButton.style.display = "block";
    createPortfolioForm.style.display = "block";
    portfolioList.style.display = "block";
    cash.style.display = "block";
    fetchPortfolios(userId, portfolioList, handlePortfolioClick); // Fetch portfolios after login
    const cashBal = await fetchUserCash(userId); // Fetch user cash after login
    cashBalanceElement.innerText = `Cash Balance: $${cashBal}`; // Display cash balance
    stockSection.style.display = "block"; // Show stock section on homepage
    portfolioSection.style.display = "block"; // Show portfolio section on homepage
    addDailyStockForm.style.display = "block"; // Show add daily stock form on homepage
    stockSection.style.display = "block"; // Show stock section on homepage
    stats.style.display = "block"; // Show statistics section on homepage
    friendSection.style.display = "block"; // Show friends section on homepage
    // load the stock lists
    loadStockLists();

    // Update portfolio dropdown
    await updatePortfolioDropdown(userId);
  };

  const loadAuth = () => {
    authStatus.textContent = "";
    registerForm.style.display = "block";
    loginForm.style.display = "block";
    for (let container of formContainers) {
      container.style.display = "block";
    }
    createPortfolioForm.style.display = "none";
    portfolioList.style.display = "none";
    logoutButton.style.display = "none";
    cash.style.display = "none"; // Hide cash management section on sign-in/sign-up page
    stockSection.style.display = "none"; // Hide stock section on sign-in/sign-up page
    portfolioSection.style.display = "none"; // Hide portfolio section on sign-in/sign-up page
    addDailyStockForm.style.display = "none"; // Hide add daily stock form on sign-in/sign-up page
    stockSection.style.display = "none"; // Hide stock section on sign-in/sign-up page
    stats.style.display = "none";
    friendSection.style.display = "none"; // Hide friends section on sign-in/sign-up page
  };

  checkAuthStatus(loadHomepage, loadAuth, logSessionCookie);

  registerForm.addEventListener("submit", (e) =>
    registerUser(
      e,
      () => checkAuthStatus(loadHomepage, loadAuth, logSessionCookie),
      logSessionCookie
    )
  );
  loginForm.addEventListener("submit", (e) =>
    loginUser(
      e,
      () => checkAuthStatus(loadHomepage, loadAuth, logSessionCookie),
      logSessionCookie
    )
  );
  logoutButton.addEventListener("click", () =>
    logoutUser(loadAuth, logSessionCookie)
  );
  createPortfolioForm.addEventListener("submit", async (e) => {
    await createPortfolio(e, userId, fetchPortfolios, handlePortfolioClick);
    await updatePortfolioDropdown(userId); // Update portfolio dropdown after creating a new portfolio
  });
  depositForm.addEventListener("submit", (e) => depositCash(e, userId));
  withdrawForm.addEventListener("submit", (e) => withdrawCash(e, userId));
  addDailyStockForm.addEventListener("submit", (e) => addDailyStock(e));

  // Function to display friends
  const displayFriends = (friends) => {
    friendsList.innerHTML = "";
    friends.forEach((friend) => {
      const li = document.createElement("li");
      li.textContent = friend.friend_email;

      const removeButton = document.createElement("button");
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", async () => {
        const userEmail = localStorage.getItem("userEmail");
        await deleteFriend(userEmail, friend.friend_email);
        // Refresh the friends list
        const updatedFriends = await viewFriends(userEmail);
        displayFriends(updatedFriends);
      });

      li.appendChild(removeButton);
      friendsList.appendChild(li);
    });
  };

  // Function to display friend requests
  const displayFriendRequests = (requests) => {
    friendRequestsList.innerHTML = "";
    requests.forEach((request) => {
      const li = document.createElement("li");
      li.textContent = request.requester_email;

      const acceptButton = document.createElement("button");
      acceptButton.textContent = "Accept";
      acceptButton.addEventListener("click", async () => {
        const userEmail = localStorage.getItem("userEmail");
        await acceptFriendRequest(userEmail, request.requester_email);
        // Refresh the friend requests list
        const updatedRequests = await viewFriendRequests(userEmail);
        displayFriendRequests(updatedRequests);
      });

      const rejectButton = document.createElement("button");
      rejectButton.textContent = "Reject";
      rejectButton.addEventListener("click", async () => {
        const userEmail = localStorage.getItem("userEmail");
        await deleteFriend(userEmail, request.requester_email);
        // Refresh the friend requests list
        const updatedRequests = await viewFriendRequests(userEmail);
        displayFriendRequests(updatedRequests);
      });

      li.appendChild(acceptButton);
      li.appendChild(rejectButton);
      friendRequestsList.appendChild(li);
    });
  };
  // Event listener for sending a friend request
  sendRequestButton.addEventListener("click", async () => {
    const friendEmail = friendEmailInput.value;
    const userEmail = localStorage.getItem("userEmail");
    if (friendEmail) {
      await sendFriendRequest(userEmail, friendEmail);
      friendEmailInput.value = ""; // Clear the input field after sending the request
    }
  });

  // Event listener for viewing friends
  viewFriendsButton.addEventListener("click", async () => {
    const userEmail = localStorage.getItem("userEmail");
    const friends = await viewFriends(userEmail);
    displayFriends(friends);
  });

  // Event listener for viewing friend requests
  viewFriendRequestsButton.addEventListener("click", async () => {
    const userEmail = localStorage.getItem("userEmail");
    const requests = await viewFriendRequests(userEmail);
    displayFriendRequests(requests);
  });
});
