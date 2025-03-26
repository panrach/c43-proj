import express from "express";
const router = express.Router();
import pool from "../../config/dbConfig.js";

// Create a new stock list
router.post("/create", async (req, res) => {
const { userId, name, stocks } = req.body;
try {
  const result = await pool.query(
    "INSERT INTO stock_lists (user_id, name) VALUES ($1, $2) RETURNING *",
    [userId, name]
  );
  const stockListId = result.rows[0].id;

  // Insert stocks into stock_list_items
  if (stocks && stocks.length > 0) {
    const stockItems = stocks
      .map((stockCode) => `(${stockListId}, '${stockCode}')`)
      .join(",");
    await pool.query(
      `INSERT INTO stock_list_items (stock_list_id, stock_code) VALUES ${stockItems}`
    );
  }

  res.status(201).json(result.rows[0]);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Share a stock list with a friend
router.post("/share", async (req, res) => {
const { listId, friendEmail } = req.body;
try {
  const friendResult = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [friendEmail]
  );
  if (friendResult.rows.length === 0) {
    return res.status(404).json({ error: "Friend not found" });
  }
  const friendId = friendResult.rows[0].id;
  await pool.query(
    "INSERT INTO shared_stock_lists (list_id, user_id) VALUES ($1, $2)",
    [listId, friendId]
  );
  res.status(200).json({ message: "Stock list shared successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Make a stock list public
router.post("/make-public", async (req, res) => {
const { listId } = req.body;
try {
  await pool.query("UPDATE stock_lists SET is_public = true WHERE id = $1", [
    listId,
  ]);
  res.status(200).json({ message: "Stock list made public" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// View shared and public stock lists
router.get('/view/:userId', async (req, res) => {
const { userId } = req.params;
try {
  const result = await pool.query(`
    SELECT sl.*, 
            array_agg(s.code) AS stocks
    FROM stock_lists sl
    LEFT JOIN stock_list_items sli ON sl.id = sli.stock_list_id
    LEFT JOIN stocks s ON sli.stock_id = s.id
    WHERE sl.is_public = true OR sl.user_id = $1
    GROUP BY sl.id
  `, [userId]);
  res.status(200).json(result.rows);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Delete a stock from a stock list using stock code
router.delete("/delete-stock/:listId/:stockCode", async (req, res) => {
const { listId, stockCode } = req.params;
try {
  await pool.query(
    `DELETE FROM stock_list_items 
      WHERE stock_list_id = $1 AND stock_id = (
        SELECT id FROM stocks WHERE code = $2
      )`,
    [listId, stockCode]
  );
  res
    .status(200)
    .json({ message: "Stock removed from stock list successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Delete an entire stock list
router.delete("/delete-list/:listId", async (req, res) => {
const { listId } = req.params;
try {
  await pool.query("DELETE FROM stock_list_items WHERE stock_list_id = $1", [
    listId,
  ]);
  await pool.query("DELETE FROM stock_lists WHERE id = $1", [listId]);
  res.status(200).json({ message: "Stock list deleted successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Add a stock to a stock list using stock code
router.post("/add-stock", async (req, res) => {
const { listId, stockCode } = req.body;
try {
  const stockResult = await pool.query(
    "SELECT id FROM stocks WHERE code = $1",
    [stockCode]
  );
  if (stockResult.rows.length === 0) {
    return res.status(404).json({ error: "Stock not found" });
  }
  const stockId = stockResult.rows[0].id;

  await pool.query(
    "INSERT INTO stock_list_items (stock_list_id, stock_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [listId, stockId]
  );
  res.status(201).json({ message: "Stock added to stock list successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// View shared and public stock lists
router.get("/view/:userId", async (req, res) => {
const { userId } = req.params;
try {
  const result = await pool.query(
    `
    SELECT sl.*, 
            array_agg(s.code) AS stocks
    FROM stock_lists sl
    LEFT JOIN stock_list_items sli ON sl.id = sli.stock_list_id
    LEFT JOIN stocks s ON sli.stock_id = s.id
    WHERE sl.is_public = true OR sl.user_id = $1
    GROUP BY sl.id
  `,
    [userId]
  );
  res.status(200).json(result.rows);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Delete a stock from a stock list using stock code
router.delete("/delete-stock/:listId/:stockCode", async (req, res) => {
const { listId, stockCode } = req.params;
try {
  await pool.query(
    `DELETE FROM stock_list_items 
      WHERE stock_list_id = $1 AND stock_id = (
        SELECT id FROM stocks WHERE code = $2
      )`,
    [listId, stockCode]
  );
  res
    .status(200)
    .json({ message: "Stock removed from stock list successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Delete an entire stock list
router.delete("/delete-list/:listId", async (req, res) => {
const { listId } = req.params;
try {
  await pool.query("DELETE FROM stock_list_items WHERE stock_list_id = $1", [
    listId,
  ]);
  await pool.query("DELETE FROM stock_lists WHERE id = $1", [listId]);
  res.status(200).json({ message: "Stock list deleted successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// Add a stock to a stock list using stock code
router.post("/add-stock", async (req, res) => {
const { listId, stockCode } = req.body;
try {
  const stockResult = await pool.query(
    "SELECT id FROM stocks WHERE code = $1",
    [stockCode]
  );
  if (stockResult.rows.length === 0) {
    return res.status(404).json({ error: "Stock not found" });
  }
  const stockId = stockResult.rows[0].id;

  await pool.query(
    "INSERT INTO stock_list_items (stock_list_id, stock_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [listId, stockId]
  );
  res.status(201).json({ message: "Stock added to stock list successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

// View shared and public stock lists
router.get("/view/:userId", async (req, res) => {
const { userId } = req.params;
try {
  const result = await pool.query(
    `
    SELECT sl.*, 
            array_agg(s.code) AS stocks
    FROM stock_lists sl
    LEFT JOIN stock_list_items sli ON sl.id = sli.stock_list_id
    LEFT JOIN stocks s ON sli.stock_id = s.id
    WHERE sl.is_public = true OR sl.user_id = $1
    GROUP BY sl.id
  `,
    [userId]
  );
  res.status(200).json(result.rows);
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});
// Add a stock to a stock list using stock code
router.post("/add-stock", async (req, res) => {
const { listId, stockCode } = req.body;
try {
  const stockResult = await pool.query(
    "SELECT id FROM stocks WHERE code = $1",
    [stockCode]
  );
  if (stockResult.rows.length === 0) {
    return res.status(404).json({ error: "Stock not found" });
  }
  const stockId = stockResult.rows[0].id;

  await pool.query(
    "INSERT INTO stock_list_items (stock_list_id, stock_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [listId, stockId]
  );
  res.status(201).json({ message: "Stock added to stock list successfully" });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: err.message });
}
});

export default router;
