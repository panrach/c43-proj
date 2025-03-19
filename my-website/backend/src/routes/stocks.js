import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

// Add a stock to a portfolio
router.post("/add", async (req, res) => {
  const portfolioId = req.body.portfolioId;
  const shares = req.body.shares;
  const code = req.body.stockSymbol;

  try {
    // Check if the portfolio exists in the portfolios table
    const portfolioCheck = await pool.query(
      "SELECT id FROM portfolios WHERE id = $1",
      [portfolioId]
    );

    if (portfolioCheck.rows.length === 0) {
      console.log("Portfolio does not exist in the portfolios table");
      return res
        .status(400)
        .json({ error: "Portfolio does not exist in the portfolios table" });
    }

    // Insert or update the stock in the stock_holdings table
    const result = await pool.query(
      `INSERT INTO stock_holdings (portfolio_id, stock_code, shares)
             VALUES ($1, $2, $3)
             ON CONFLICT (portfolio_id, stock_code)
             DO UPDATE SET shares = stock_holdings.shares + EXCLUDED.shares`,
      [portfolioId, code, shares]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Add a stock to a portfolio
router.post("/add", async (req, res) => {
  const portfolioId = req.body.portfolioId;
  const shares = req.body.shares;
  const code = req.body.stockSymbol;

  try {
    // Check if the portfolio exists in the portfolios table
    const portfolioCheck = await pool.query(
      "SELECT id FROM portfolios WHERE id = $1",
      [portfolioId]
    );

    if (portfolioCheck.rows.length === 0) {
      console.log("Portfolio does not exist in the portfolios table");
      return res
        .status(400)
        .json({ error: "Portfolio does not exist in the portfolios table" });
    }

    // Check if the stock exists in the stocks table
    const stockCheck = await pool.query(
      "SELECT id FROM stocks WHERE code = $1",
      [code]
    );

    if (stockCheck.rows.length === 0) {
      console.log("Stock does not exist in the stocks table");
      return res
        .status(400)
        .json({ error: "Stock does not exist in the stocks table" });
    }

    const stockId = stockCheck.rows[0].id;

    // Insert or update the stock in the stock_holdings table
    const result = await pool.query(
      `INSERT INTO stock_holdings (portfolio_id, stock_id, shares)
             VALUES ($1, $2, $3)
             ON CONFLICT (portfolio_id, stock_id)
             DO UPDATE SET shares = stock_holdings.shares + EXCLUDED.shares`,
      [portfolioId, stockId, shares]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
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

// delete a stock from a portfolio
router.delete("/delete", async (req, res) => {
  const portfolioId = req.body.portfolioId;
  const code = req.body.stockSymbol;
  try {
    // Check if the portfolio exists in the portfolios table
    const portfolioCheck = await pool.query(
      "SELECT id FROM portfolios WHERE id = $1",
      [portfolioId]
    );

    if (portfolioCheck.rows.length === 0) {
      console.log("Portfolio does not exist in the portfolios table");
      return res
        .status(400)
        .json({ error: "Portfolio does not exist in the portfolios table" });
    }

    // Delete the stock from the stock_holdings table
    const result = await pool.query(
      "DELETE FROM stock_holdings WHERE portfolio_id = $1 AND stock_code = $2",
      [portfolioId, code]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Stock not found in the portfolio" });
    }

    res.status(200).json({ message: "Stock deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
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

export default router;
