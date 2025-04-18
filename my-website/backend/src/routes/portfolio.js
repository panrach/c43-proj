import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

// Create a new portfolio
router.post("/create", async (req, res) => {
  const { userId, name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO portfolios (user_id, name) VALUES ($1, $2) RETURNING *",
      [userId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Get all portfolios for a user
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM portfolios WHERE user_id = $1",
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

router.post("/deposit", async (req, res) => {
  const { userId, amount } = req.body;
  if (amount <= 0) {
    return res.status(400).json({ error: "Deposit amount must be positive" });
  }
  try {
    // Update user balance
    const result = await pool.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *",
      [amount, userId]
    );

    // Record the transaction
    await pool.query(
      "INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)",
      [userId, "deposit", amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/withdraw", async (req, res) => {
  let { userId, amount } = req.body;
  amount = parseFloat(amount);
  if (amount <= 0) {
    return res
      .status(400)
      .json({ error: "Withdrawal amount must be positive" });
  }
  try {
    // Check if the user has enough balance
    const userBalance = await pool.query(
      "SELECT balance FROM users WHERE id = $1",
      [userId]
    );
    const userBal = userBalance.rows[0].balance;
    console.log("User balance:", userBal);
    console.log("Withdrawal amount:", amount);
    console.log(amount > userBal);
    if (amount > userBal) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Update user balance
    const result = await pool.query(
      "UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING *",
      [amount, userId]
    );

    // Record the transaction
    await pool.query(
      "INSERT INTO transactions (user_id, type, amount) VALUES ($1, $2, $3)",
      [userId, "withdrawal", amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId/balance", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query("SELECT balance FROM users WHERE id = $1", [
      userId,
    ]);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Get portfolio value
router.get("/:portfolioId/value", async (req, res) => {
  const { portfolioId } = req.params;
  try {
    // Get stock holdings
    const holdingsResult = await pool.query(
      `SELECT sh.stock_code, sh.shares, s.close AS last_close_price
       FROM stock_holdings sh
       JOIN (
         SELECT DISTINCT ON (code) code, close
         FROM stocks
         ORDER BY code, timestamp DESC
       ) s ON sh.stock_code = s.code
       WHERE sh.portfolio_id = $1`,
      [portfolioId]
    );

    const holdings = holdingsResult.rows;

    // Calculate market value
    let marketValue = 0;
    console.log("Holdings:", holdings);
    holdings.forEach((holding) => {
      console.log("Holding:", holding);
      console.log("Shares:", holding.shares);
      marketValue += holding.shares * holding.last_close_price;
    });

    res.status(200).json({ marketValue });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

export default router;
