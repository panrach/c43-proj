import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

router.post("/reviews", async (req, res) => {
  let { stockListId, userId, comment } = req.body;
  console.log(req.body);

  try {
    const result = await pool.query(
      `
        INSERT INTO reviews (stock_list_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
      [stockListId, userId, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write review." });
  }
});

router.get("/:stockListId", async (req, res) => {
  const { stockListId } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT r.*, u.username
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.stock_list_id = $1
        ORDER BY r.created_at DESC;
        `,
      [stockListId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
});

router.put("/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;
  const { comment } = req.body;

  try {
    const result = await pool.query(
      `
        UPDATE reviews
        SET comment = $1, created_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
        `,
      [comment, reviewId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit review." });
  }
});

router.delete("/reviews/:reviewId", async (req, res) => {
  const { reviewId } = req.params;

  try {
    await pool.query(
      `
        DELETE FROM reviews
        WHERE id = $1;
        `,
      [reviewId]
    );
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review." });
  }
});

export default router;
