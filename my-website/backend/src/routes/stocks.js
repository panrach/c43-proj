import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

// Add a stock to a portfolio
router.post("/add", async (req, res) => {
  const { userId, portfolioId, stockSymbol, shares } = req.body;

  if (shares <= 0) {
    return res.status(400).json({ error: "Shares must be a positive number" });
  }

  try {
    // Get the latest close price of the stock
    const stockPriceResult = await pool.query(
      `SELECT close AS last_close_price
       FROM stocks
       WHERE code = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [stockSymbol]
    );

    if (stockPriceResult.rows.length === 0) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const lastClosePrice = stockPriceResult.rows[0].last_close_price;
    const totalCost = shares * lastClosePrice;

    // Check if the user has enough balance
    const userBalanceResult = await pool.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );

    if (userBalanceResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userBalance = userBalanceResult.rows[0].balance;

    if (totalCost > userBalance) {
      return res
        .status(400)
        .json({
          error: "Insufficient funds",
          message: "You do not have enough funds to buy this stock.",
        });
    }

    // Deduct the cost from the user's balance
    await pool.query("UPDATE users SET balance = balance - $1 WHERE id = $2", [
      totalCost,
      userId,
    ]);

    // Add or update the stock in the portfolio
    const result = await pool.query(
      `INSERT INTO stock_holdings (portfolio_id, stock_code, shares)
       VALUES ($1, $2, $3)
       ON CONFLICT (portfolio_id, stock_code)
       DO UPDATE SET shares = stock_holdings.shares + EXCLUDED.shares
       RETURNING *`,
      [portfolioId, stockSymbol, shares]
    );

    // Record the transaction
    await pool.query(
      "INSERT INTO transactions (user_id, type, amount, stock_code) VALUES ($1, $2, $3, $4)",
      [userId, "buy", totalCost, stockSymbol]
    );

    res.status(201).json({
      message: "Stock added successfully",
      stock: result.rows[0],
      lastClosePrice,
      totalCost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all stocks in a portfolio
router.get("/portfolio/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM stock_holdings WHERE portfolio_id = $1",
      [portfolioId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Sell a stock from a portfolio
router.post("/sell", async (req, res) => {
  const { portfolioId, stockSymbol, shares } = req.body;

  if (shares <= 0) {
    return res.status(400).json({ error: "Shares must be a positive number" });
  }

  try {
    // Check if the portfolio exists in the portfolios table
    const portfolioCheck = await pool.query(
      "SELECT id, user_id FROM portfolios WHERE id = $1",
      [portfolioId]
    );

    if (portfolioCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Portfolio does not exist in the portfolios table" });
    }

    const userId = portfolioCheck.rows[0].user_id;

    // Check if the stock exists in the stock_holdings table
    const stockCheck = await pool.query(
      "SELECT shares FROM stock_holdings WHERE portfolio_id = $1 AND stock_code = $2",
      [portfolioId, stockSymbol]
    );

    if (stockCheck.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Stock does not exist in the portfolio" });
    }

    const currentShares = stockCheck.rows[0].shares;

    if (currentShares < shares) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    // Get the latest stock price
    const stockPrice = await getStockPrice(stockSymbol);
    const valueOfSoldShares = shares * stockPrice;

    const newShares = currentShares - shares;

    if (newShares === 0) {
      // Delete the stock from the stock_holdings table
      await pool.query(
        "DELETE FROM stock_holdings WHERE portfolio_id = $1 AND stock_code = $2",
        [portfolioId, stockSymbol]
      );
    } else {
      // Update the number of shares in the stock_holdings table
      await pool.query(
        "UPDATE stock_holdings SET shares = $1 WHERE portfolio_id = $2 AND stock_code = $3",
        [newShares, portfolioId, stockSymbol]
      );
    }

    // Add the value of the sold shares to the user's cash balance
    const updateBalanceResult = await pool.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING balance",
      [valueOfSoldShares, userId]
    );
    const updatedBalance = updateBalanceResult.rows[0].balance;

    // Record the transaction
    await pool.query(
      "INSERT INTO transactions (user_id, type, amount, stock_code) VALUES ($1, $2, $3, $4)",
      [userId, "sell", valueOfSoldShares, stockSymbol]
    );

    res.status(200).json({
      message: "Stock sold successfully",
      valueOfSoldShares,
      updatedBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Search stocks
router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      "SELECT DISTINCT code FROM stocks WHERE code ILIKE $1 LIMIT 10",
      [`%${query}%`]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

router.get("/details/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const result = await pool.query("SELECT * FROM stocks WHERE code = $1", [
      code,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Add daily stock information
router.post("/add-daily", async (req, res) => {
  const { date, code, open, high, low, close, volume } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stocks (timestamp, code, open, high, low, close, volume)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [date, code, open, high, low, close, volume]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

const getStockPrice = async (stockCode) => {
  try {
    const result = await pool.query(
      `SELECT close AS last_close_price
       FROM stocks
       WHERE code = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [stockCode]
    );

    if (result.rows.length === 0) {
      throw new Error("Stock not found");
    }

    const lastClosePrice = result.rows[0].last_close_price;
    return lastClosePrice;
  } catch (err) {
    console.log(err);
  }
};

// Fetch historical stock data
router.get("/historical/:stockCode", async (req, res) => {
  const { stockCode } = req.params;
  const { interval } = req.query;
  const intervalDays = parseInt(interval, 10);
  console.log("Interval:", intervalDays);

  try {
    const result = await pool.query(
      `SELECT * FROM stocks WHERE code = $1 AND timestamp >= NOW() - INTERVAL '${intervalDays} days' ORDER BY timestamp ASC`,
      [stockCode]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Fetch new stock data
router.get("/latest/:stockCode", async (req, res) => {
  const { stockCode } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM stocks WHERE code = $1 ORDER BY timestamp DESC LIMIT 1",
      [stockCode]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

router.get("/predict-prices/:stockCode", async (req, res) => {
  const { stockCode } = req.params;
  try {
    const result = await pool.query(
      `
      WITH historical_data AS (
        SELECT timestamp AS date, close, ROW_NUMBER() OVER (ORDER BY timestamp) - 1 AS index
        FROM stocks
        WHERE code = $1
        ORDER BY timestamp ASC
      ),
      regression AS (
        SELECT
          COUNT(*) AS n,
          SUM(index) AS sumX,
          SUM(close) AS sumY,
          SUM(index * close) AS sumXY,
          SUM(index * index) AS sumX2
        FROM historical_data
      ),
      parameters AS (
        SELECT
          (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) AS slope,
          (sumY - ((n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)) * sumX) / n AS intercept
        FROM regression
      ),
      future_prices AS (
        SELECT
          slope * (index + i) + intercept AS future_price
        FROM parameters, generate_series(1, 5) AS i, (SELECT MAX(index) AS index FROM historical_data) AS max_index
      )
      SELECT future_price AS close
      FROM future_prices
      `,
      [stockCode]
    );

    const futurePrices = result.rows.map((row) => row.close);
    res.status(200).json({ futurePrices });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

export default router;
