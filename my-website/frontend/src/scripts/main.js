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
import { fetchStocks, addStock, searchStocks, addDailyStock, deleteStock } from "./stocks.js";

const baseUrl = "http://localhost:3000";

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

  let userId = null; // Define userId variable

  const logSessionCookie = () => {
    console.log("Session Cookie:", document.cookie);
  };

  const updatePortfolioDropdown = async (userId) => {
    const response = await fetch(`${baseUrl}/portfolio/user/${userId}`, {
      credentials: 'include' // Include credentials for session handling
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

  stockSearchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    if (query.length > 0) {
      searchStocks(query, stockSearchResults);
    } else {
      stockSearchResults.innerHTML = "";
    }
  });

  addStockForm.addEventListener("submit", (e) => addStock(e, fetchStocks));

  const handlePortfolioClick = (portfolioId, portfolioElement) => {
    const stockSection = portfolioElement.querySelector(".stock-section");
    const stockList = portfolioElement.querySelector(".stock-list");

    if (stockSection.style.display === "none") {
      stockSection.style.display = "block";
      fetchStocks(portfolioId, stockList);
    } else {
      stockSection.style.display = "none";
    }
  };

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
});