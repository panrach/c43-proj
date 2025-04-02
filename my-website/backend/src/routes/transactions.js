import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

router.get("/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;

  try {
    // Get the user ID associated with the portfolio
    const portfolioResult = await pool.query(
      "SELECT user_id FROM portfolios WHERE id = $1",
      [portfolioId]
    );

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({ error: "Portfolio not found" });
    }

    const userId = portfolioResult.rows[0].user_id;

    // Fetch transactions for the user
    const transactionsResult = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC",
      [userId]
    );

    res.status(200).json(transactionsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;