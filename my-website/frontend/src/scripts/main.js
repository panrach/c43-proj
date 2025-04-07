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
  getOwner,
} from "./stockList.js";

import {
  writeReview,
  fetchReviews,
  editReview,
  deleteReview,
} from "./reviews.js";

import {
  fetchTransactions,
  displayTransactions
} from "./transactions.js";

const baseUrl = "http://localhost:3000";

export const handlePortfolioClick = (portfolioId, portfolioElement) => {
  const stockSection = portfolioElement.querySelector(".stock-section");
  const stockList = portfolioElement.querySelector(".stock-list");

  if (stockSection.style.display === "none") {
    stockSection.style.display = "block";
    fetchStocks(portfolioId, stockList);
    displayTransactions(portfolioId);
    // Fetch transactions for the selected portfolio
    // displayStatistics(portfolioId);
    // statsSection.scrollIntoView({ behavior: "smooth" });

  } else {
    stockSection.style.display = "none";
  }
};

const createNavbar = () => {

  const navBar = document.createElement("nav");
  navBar.id = "main-nav";
  navBar.innerHTML = `
    <ul>
      <li><a href="#portfolio-section">Portfolios</a></li>
      <li><a href="#stock-section">Stocks</a></li>
      <li><a href="#statistics-section">Statistics</a></li>
      <li><a href="#friends-section">Friends</a></li>
      <li><a href="#stock-list-section">Stock Lists</a></li>
    </ul>
  `;
  document.body.insertBefore(navBar, document.body.firstChild);

  // Add smooth scrolling to sections
  const navLinks = navBar.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

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

  const addStockToListForm = document.getElementById("add-stock-to-list-form");
  const sLNameInput = document.getElementById("stock-list-name-input");
  const stockCodeInput = document.getElementById("stock-code-list-input");

  const reviewsList = document.getElementById("reviews-list");
  const reviewStockListDropdown = document.getElementById(
    "review-stock-list-dropdown"
  );
  const writeReviewForm = document.getElementById("write-review-form");
  const portfolioSelectStatistics = document.getElementById("portfolio-select-statistics");


  document.getElementById("date-range-form").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    // Get the selected portfolio ID from the dropdown
    const portfolioSelectStatistics = document.getElementById("portfolio-select-statistics");
    const portfolioId = portfolioSelectStatistics.value;
  
    if (!portfolioId) {
      alert("Please select a portfolio.");
      return;
    }
  
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
  
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    try {
      // Call the function to display statistics with the selected portfolio ID and date range
      await displayStatistics(portfolioId, startDate, endDate);
      event.target.reset(); // Reset the form after successful submission
    } catch (error) {
      console.error("Error fetching statistics:", error);
      alert("Failed to fetch statistics. Please try again.");
    }
  });

  const populatePortfolioDropdownStatistics = async (userId) => {
    const response = await fetch(`${baseUrl}/portfolio/user/${userId}`, {
      credentials: "include", // Include credentials for session handling
    });
    const portfolios = await response.json();
    portfolioSelectStatistics.innerHTML = '<option value="" disabled selected>Select Portfolio</option>';
    portfolios.forEach((portfolio) => {
      const option = document.createElement("option");
      option.value = portfolio.id;
      option.textContent = portfolio.name;
      portfolioSelectStatistics.appendChild(option);
    });
  };

  writeReviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const stockListId = reviewStockListDropdown.value;
    const comment = document.getElementById("review-comment").value;

    if (!stockListId || !comment) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      await writeReview(stockListId, userId, comment);
      alert("Review submitted successfully!");
      writeReviewForm.reset();
      displayReviews(stockListId); // Refresh reviews for the selected stock list
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    }
  });

  let userId = null; // Define userId variable

  const logSessionCookie = () => {
    console.log("Session Cookie:", document.cookie);
  };

  const displayReviews = async (stockListId) => {
    try {
      const reviews = await fetchReviews(stockListId);
      const owner = await getOwner(stockListId);
      console.log(owner);
      reviewsList.innerHTML = ""; // Clear existing reviews

      if (reviews.length === 0) {
        reviewsList.innerHTML =
          "<li>No reviews available for this stock list.</li>";
        return;
      }
      reviews.forEach((review) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${review.username}</strong>: ${review.comment} 
        `;

        // Add "Delete" button if the review belongs to the current user
        // or if the stock list is owned by the user
        if (review.user_id == userId || owner.user_id == userId) {
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () => {
            deleteReview(review.id)
              .then(() => {
                alert("Review deleted successfully!");
                displayReviews(stockListId); // Refresh reviews
              })
              .catch((err) => {
                console.error("Failed to delete review:", err);
                alert("Failed to delete review. Please try again.");
              });
          });
          li.appendChild(deleteButton);

          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.addEventListener("click", () => {
            // prompt user to enter new comment
            const newComment = prompt("Enter new comment:");
            if (!newComment) {
              alert("Please enter a valid comment.");
              return;
            }
            editReview(review.id, newComment)
            // Refresh reviews
            .then(() => displayReviews(stockListId))
          });
          li.appendChild(editButton);
        }
        reviewsList.appendChild(li);
      });
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      reviewsList.innerHTML =
        "<li>Error fetching reviews. Please try again later.</li>";
    }
  };

  // Event listener for stock list dropdown change
  reviewStockListDropdown.addEventListener("change", (e) => {
    const stockListId = e.target.value;
    if (stockListId) {
      displayReviews(stockListId);
    }
  });

  const populateReviewDropdown = async () => {
    const stockLists = await fetchStockLists(userId);
    reviewStockListDropdown.innerHTML =
      '<option value="" disabled selected>Select a Stock List</option>';
    stockLists.forEach((list) => {
      const option = document.createElement("option");
      option.value = list.id;
      option.textContent = list.name;
      reviewStockListDropdown.appendChild(option);
    });
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
    let stockLists = await fetchStockLists(userId);
    console.log(stockLists);

    stockListDropdown.innerHTML = "";
    userStockLists.innerHTML = "";

    stockLists.forEach((list) => {
      // const li = document.createElement("li");
      // li.textContent = list.name;
      // userStockLists.appendChild(li);
      if (list.user_id == userId) {
        const option = document.createElement("option");
        option.value = list.id;
        option.textContent = list.name;
        stockListDropdown.appendChild(option);
      }
    });

    stockLists.forEach((list) => {
      // Create a container for each stock list
      const listContainer = document.createElement("div");
      listContainer.className = "stock-list-container";

      // Add the stock list name
      const listTitle = document.createElement("h3");
      listTitle.textContent = list.name;
      listContainer.appendChild(listTitle);

      // Add the stocks in the stock list
      const stockList = document.createElement("ul");
      list.stocks.forEach((stockCode) => {
        const stockItem = document.createElement("li");
        stockItem.textContent = stockCode;
        stockList.appendChild(stockItem);
      });
      listContainer.appendChild(stockList);

      // Append the container to the userStockLists element
      userStockLists.appendChild(listContainer);
    });
  };

  createStockListForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createStockList(userId, stockListNameInput.value);
    stockListNameInput.value = "";
    e.target.reset(); // Reset the form after submission
    loadStockLists();
  });

  // Event listener for adding a stock to a stock list
  addStockToListForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const stockListName = sLNameInput.value.trim();
    const stockCode = stockCodeInput.value;

    if (stockListName && stockCode) {
      try {
        // Fetch all stock lists to find the ID of the entered stock list name
        const stockLists = await fetchStockLists(userId);
        const stockList = stockLists.find(
          (list) => list.name === stockListName
        );

        if (!stockList) {
          alert(`Stock list "${stockListName}" not found.`);
          return;
        }

        // Add the stock to the stock list
        await addStockToList(stockList.id, stockCode);
        alert(
          `Stock "${stockCode}" added to the list "${stockListName}" successfully!`
        );
        stockListNameInput.value = ""; // Clear the input field
        stockCodeInput.value = ""; // Clear the input field
        e.target.reset(); // Reset the form after submission
      } catch (err) {
        alert("Failed to add stock to the list. Please try again.");
        console.error(err);
      }
    } else {
      alert("Please enter both the stock list name and stock code.");
    }
  });

  shareStockListButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    const friendEmail = prompt(
      "Enter your friend's email to share the stock list:"
    );
    if (!friendEmail) {
      alert("You must enter a valid email address.");
      return;
    }

    await shareStockList(listId, friendEmail, userId);
  });

  makePublicButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    await makeStockListPublic(listId);
  });

  deleteStockListButton.addEventListener("click", async () => {
    const listId = stockListDropdown.value;
    await deleteStockList(listId);
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
    stockListSection.style.display = "block"; // Show stock list section on homepage

    // load the stock lists
    loadStockLists();

    // creat the navbar
    createNavbar();

    // Call this function after user login or when stock lists are loaded
    populateReviewDropdown();

    // Update portfolio dropdown
    await updatePortfolioDropdown(userId);

    await populatePortfolioDropdownStatistics(userId);
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
    stockListSection.style.display = "none"; // Show stock list section on homepage

    // Remove the navbar if it exists
    const navBar = document.getElementById("main-nav");
    if (navBar) {
      navBar.remove();
  }
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
    await populatePortfolioDropdownStatistics(userId); // Update portfolio dropdown for statistics
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
    // clear the list (in case there is requests displayed or something else)
    friendsList.innerHTML = "";
    friendRequestsList.innerHTML = "";
    const userEmail = localStorage.getItem("userEmail");
    const friends = await viewFriends(userEmail);
    displayFriends(friends);
  });

  // Event listener for viewing friend requests
  viewFriendRequestsButton.addEventListener("click", async () => {
    // clear the list (in case there is friends displayed or something else)
    friendsList.innerHTML = "";
    friendRequestsList.innerHTML = "";
    const userEmail = localStorage.getItem("userEmail");
    const requests = await viewFriendRequests(userEmail);
    displayFriendRequests(requests);
  });
});
