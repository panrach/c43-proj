import express from 'express';
import pool from '../../config/dbConfig.js';

const router = express.Router();

// Create a new portfolio
router.post('/create', async (req, res) => {
    const { userId, name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO portfolios (user_id, name) VALUES ($1, $2) RETURNING *',
            [userId, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

// Get all portfolios for a user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT * FROM portfolios WHERE user_id = $1', [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

// Add stock to portfolio
router.post('/add-stock', async (req, res) => {
    const { portfolioId, stockSymbol, shares } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO stock_holdings (portfolio_id, stock_symbol, shares) VALUES ($1, $2, $3) RETURNING *',
            [portfolioId, stockSymbol, shares]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

router.post('/deposit', async (req, res) => {
    const {userId, amount} = req.body;
    // if the amount is negative, return an error
    if (amount < 0) {
        return res.status(400).json({ error: 'Deposit amount cannot be negative' });
    }
    try {
        const result = await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *',
            [amount, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

router.post('/withdraw', async (req, res) => {
    const {userId, amount} = req.body;
    if (amount < 0) {
        return res.status(400).json({ error: 'Withdrawal amount cannot be negative' });
    }
    // get the user's balance and check if the withdrawal amount is greater than the balance
    const userBalance = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
    if (amount > userBalance.rows[0].balance) {
        return res.status(400).json({ error: 'Insufficient funds' });
    }
    try {
        const result = await pool.query(
            'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING *',
            [amount, userId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

router.get('/:userId/balance', async (req, res) => {
    console.log("poop")
    const {userId} = req.params;
    try {
        const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

// Get portfolio value
router.get('/:portfolioId/value', async (req, res) => {
    const { portfolioId } = req.params;
    try {
        // Get stock holdings
        const holdingsResult = await pool.query(
            `SELECT sh.stock_code, sh.shares, s.close AS last_close_price
             FROM stock_holdings sh
             JOIN stocks s ON sh.stock_code = s.code
             WHERE sh.portfolio_id = $1
             ORDER BY s.timestamp DESC`,
            [portfolioId]
        );

        const holdings = holdingsResult.rows;

        // Calculate market value
        let marketValue = 0;
        holdings.forEach(holding => {
            marketValue += holding.shares * holding.last_close_price;
        });

        console.log('Market value:', marketValue);

        res.status(200).json({ marketValue });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.detail });
    }
});

export default router;