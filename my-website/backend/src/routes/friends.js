import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

// Send a friend request
router.post("/send-request", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);
    const friendResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [friendEmail]);

    if (userResult.rows.length === 0 || friendResult.rows.length === 0) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    const userId = userResult.rows[0].id;
    const friendId = friendResult.rows[0].id;

    const result = await pool.query(
      `INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, 'pending') RETURNING *`,
      [userId, friendId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Accept a friend request
router.post("/accept-request", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);
    const friendResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [friendEmail]);

    if (userResult.rows.length === 0 || friendResult.rows.length === 0) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    const userId = userResult.rows[0].id;
    const friendId = friendResult.rows[0].id;

    const result = await pool.query(
      `UPDATE friends SET status = 'accepted' WHERE user_id = $1 AND friend_id = $2 RETURNING *`,
      [friendId, userId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// View friends
router.get("/view/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `SELECT f.*, u.email AS friend_email
       FROM friends f
       JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
       WHERE (f.user_id = $1 OR f.friend_id = $1) AND f.status = 'accepted' AND u.id != $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// View friend requests
router.get("/requests/:userEmail", async (req, res) => {
  const { userEmail } = req.params;
  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `SELECT f.*, u.email AS requester_email
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Delete a friend
router.delete("/delete", async (req, res) => {
  const { userEmail, friendEmail } = req.body;
  try {
    const userResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [userEmail]);
    const friendResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [friendEmail]);

    if (userResult.rows.length === 0 || friendResult.rows.length === 0) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    const userId = userResult.rows[0].id;
    const friendId = friendResult.rows[0].id;

    const result = await pool.query(
      `DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1) RETURNING *`,
      [userId, friendId]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

export default router;