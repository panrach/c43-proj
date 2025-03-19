const baseUrl = "http://localhost:3000";
import { fetchPortfolios } from "./portfolio.js";

export const fetchStocks = async (portfolioId, stockList) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/portfolio/${portfolioId}`, {
      credentials: "include", // Include credentials for session handling
    });
    const stocks = await response.json();
    console.log(stocks);
    stockList.innerHTML = "";
    stocks.forEach((stock) => {
      const li = document.createElement("li");
      li.textContent = `${stock.stock_code}: ${stock.shares} shares`;

      // Create a delete button for each stock
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", async () => {
        await deleteStock(portfolioId, stock.stock_code, fetchStocks);
        // refresh the stock list
        fetchStocks(portfolioId, stockList);
        // refresh portfolio details
        fetchPortfolios(userId, document.getElementById("portfolio-list"), handlePortfolioClick);
      });

      li.appendChild(deleteButton);
      stockList.appendChild(li);

      li.addEventListener("click", () => {
        fetchStockDetails(stock.stock_code);
      });
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
  }
};

export const addStock = async (e, fetchStocks) => {
  e.preventDefault();
  const portfolioId = document.getElementById("portfolio-select").value; // Get the selected portfolio ID from the dropdown
  const stockSymbol = e.target
    .querySelector("input.stock-symbol")
    .value.trim()
    .toUpperCase();
  const shares = e.target.querySelector(".shares").value;
  console.log(portfolioId, stockSymbol, shares);
  try {
    const response = await fetch(`${baseUrl}/stocks/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ portfolioId, shares, stockSymbol }),
      credentials: "include", // Include credentials for session handling
    });
    if (response.ok) {
      alert("Stock added successfully");
      fetchStocks(portfolioId, document.getElementById("stock-list")); // Refresh the stock list
    } else {
      alert("Error adding stock");
    }
  } catch (error) {
    console.error("Error adding stock:", error);
  }
};

export const deleteStock = async (portfolioId, stockSymbol, fetchStocks) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ portfolioId, stockSymbol }),
      credentials: "include", // Include credentials for session handling
    });
    if (response.ok) {
      alert("Stock deleted successfully");
      fetchStocks(portfolioId, document.getElementById("stock-list")); // Refresh the stock list
      // refresh portfolio details
      fetchPortfolios(userId, document.getElementById("portfolio-list"), handlePortfolioClick);
    } else {
      alert("Error deleting stock");
    }
  } catch (error) {
    console.error("Error deleting stock:", error);
  }
};

export const searchStocks = async (query, searchResults) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/search?query=${query}`, {
      credentials: "include", // Include credentials for session handling
    });
    const stocks = await response.json();
    searchResults.innerHTML = "";
    stocks.forEach((stock) => {
      const li = document.createElement("li");
      li.textContent = `${stock.code}`;
      li.addEventListener("click", () => {
        document.querySelector(".stock-symbol").value = stock.code;
        searchResults.innerHTML = "";
        fetchStockDetails(stock.code);
      });
      searchResults.appendChild(li);
    });
  } catch (error) {
    console.error("Error searching stocks:", error);
  }
};

export const fetchStockDetails = async (code) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/details/${code}`, {
      credentials: "include", // Include credentials for session handling
    });
    const stock = await response.json();
    displayStockDetails(stock);
  } catch (error) {
    console.error("Error fetching stock details:", error);
  }
};

const displayStockDetails = (stock) => {
  const stockDetails = document.getElementById("stock-details");
  console.log(stock);
  stockDetails.innerHTML = `
      <h3>${stock.code}</h3>
      <p>Open: ${stock.open}</p>
      <p>High: ${stock.high}</p>
      <p>Low: ${stock.low}</p>
      <p>Close: ${stock.close}</p>
      <p>Volume: ${stock.volume}</p>
      <p>Timestamp: ${stock.timestamp}</p>
    `;
};

export const addDailyStock = async (e) => {
  e.preventDefault();
  const date = document.getElementById("stock-date").value;
  const code = document.getElementById("stock-code").value.trim().toUpperCase();
  const open = parseFloat(document.getElementById("stock-open").value);
  const high = parseFloat(document.getElementById("stock-high").value);
  const low = parseFloat(document.getElementById("stock-low").value);
  const close = parseFloat(document.getElementById("stock-close").value);
  const volume = parseInt(document.getElementById("stock-volume").value, 10);

  try {
    const response = await fetch(`${baseUrl}/stocks/add-daily`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, code, open, high, low, close, volume }),
      credentials: "include", // Include credentials for session handling
    });
    if (response.ok) {
      alert("Daily stock information added successfully");
    } else {
      alert("Error adding daily stock information");
    }
  } catch (error) {
    console.error("Error adding daily stock information:", error);
  }
};