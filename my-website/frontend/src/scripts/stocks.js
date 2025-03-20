const baseUrl = "http://localhost:3000";
import { fetchPortfolios, fetchUserCash } from "./portfolio.js";
import { handlePortfolioClick } from "./main.js";
let historicalChart = null;

export const fetchStockValue = async (stockCode) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/value/${stockCode}`, {
      credentials: "include", // Include credentials for session handling
    });
    const result = await response.json();
    if (response.ok) {
      return result.lastClosePrice;
    } else {
      alert(result.error || "Error fetching stock value");
      return null;
    }
  } catch (error) {
    console.error("Error fetching stock value:", error);
    return null;
  }
};

export const fetchStocks = async (portfolioId, stockList) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/portfolio/${portfolioId}`, {
      credentials: "include", // Include credentials for session handling
    });
    const stocks = await response.json();
    const userId = localStorage.getItem("userId");
    console.log(stocks);
    stockList.innerHTML = "";
    stocks.forEach((stock) => {
      const li = document.createElement("li");
      li.textContent = `${stock.stock_code}: ${stock.shares} shares`;

      // Create a sell button for each stock
      const sellButton = document.createElement("button");
      sellButton.textContent = "Sell";
      sellButton.addEventListener("click", async () => {
        const sharesToSell = prompt("Enter the number of shares to sell:");
        if (sharesToSell && !isNaN(sharesToSell) && sharesToSell > 0) {
          await sellStock(
            portfolioId,
            stock.stock_code,
            parseInt(sharesToSell),
            fetchStocks
          );
          // refresh the stock list
          fetchStocks(portfolioId, stockList);
          // refresh portfolio details
          fetchPortfolios(
            userId,
            document.getElementById("portfolio-list"),
            handlePortfolioClick
          );
        }
      });

      li.appendChild(sellButton);
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
      fetchPortfolios(
        userId,
        document.getElementById("portfolio-list"),
        handlePortfolioClick
      ); // Refresh the portfolio list
    } else {
      alert("Error adding stock");
    }
  } catch (error) {
    console.error("Error adding stock:", error);
  }
};

export const sellStock = async (
  portfolioId,
  stockSymbol,
  shares,
  fetchStocks
) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ portfolioId, stockSymbol, shares }),
      credentials: "include", // Include credentials for session handling
    });
    console.log("RESPONSE", response);
    const userId = localStorage.getItem("userId");
    if (response.ok) {
      alert("Stock sold successfully");
      fetchStocks(portfolioId, document.getElementById("stock-list")); // Refresh the stock list
      // refresh cash balance
      const cashBal = await fetchUserCash(userId); // Fetch user cash after login
      // document.getElementById('cash-balance').innerText = `Cash Balance: $${response.updatedBalance}`;
      // refresh portfolio details
      fetchPortfolios(
        userId,
        document.getElementById("portfolio-list"),
        handlePortfolioClick
      );
    } else {
      alert("Error selling stock");
    }
  } catch (error) {
    console.error("Error selling stock:", error);
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

// Display stock data
const displayLatestStockData = (stockData) => {
  const stockDetails = document.getElementById("latest-stock-details");
  stockDetails.innerHTML = `
    <h3>Latest Data for ${stockData.code}</h3>
    <p>Open: ${stockData.open}</p>
    <p>High: ${stockData.high}</p>
    <p>Low: ${stockData.low}</p>
    <p>Close: ${stockData.close}</p>
    <p>Volume: ${stockData.volume}</p>
    <p>Timestamp: ${stockData.timestamp}</p>
  `;
};

// Display historical stock data
const displayHistoricalStockData = (historicalData) => {
  const ctx = document
    .getElementById("historical-stock-chart")
    .getContext("2d");
  const labels = historicalData.map((data) => data.timestamp);
  const closePrices = historicalData.map((data) => data.close);

  // Destroy the existing chart if it exists
  if (historicalChart) {
    historicalChart.destroy();
  }

  historicalChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Close Price",
          data: closePrices,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: "time",
          time: {
            unit: "day",
          },
        },
        y: {
          beginAtZero: false,
        },
      },
    },
  });
};

// Fetch historical stock data
export const fetchHistoricalStockData = async (stockCode, interval) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/historical/${stockCode}?interval=${interval}`, {
      credentials: "include", // Include credentials for session handling
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      alert(result.error || "Error fetching historical stock data");
      return null;
    }
  } catch (error) {
    console.error("Error fetching historical stock data:", error);
    return null;
  }
};

// Fetch latest stock data
export const fetchLatestStockData = async (stockCode) => {
  try {
    const response = await fetch(`${baseUrl}/stocks/latest/${stockCode}`, {
      credentials: "include", // Include credentials for session handling
    });
    const result = await response.json();
    if (response.ok) {
      return result;
    } else {
      alert(result.error || "Error fetching latest stock data");
      return null;
    }
  } catch (error) {
    console.error("Error fetching latest stock data:", error);
    return null;
  }
};

// Event listener for fetching and displaying stock data
document
  .getElementById("fetch-stock-data")
  .addEventListener("click", async () => {
    const stockCode = document.getElementById("stock-code-input").value;
    const interval = document.getElementById("interval-select").value;
    const historicalData = await fetchHistoricalStockData(stockCode, interval);
    const latestData = await fetchLatestStockData(stockCode);

    if (historicalData) {
      console.log("Historical Data:", historicalData);
      displayHistoricalStockData(historicalData);
    }

    if (latestData) {
      console.log("Latest Data:", latestData);
      displayLatestStockData(latestData);
    }
  });

