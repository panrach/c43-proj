import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

// Get the covariance matrix of the stocks in a portfolio
router.get("/covariance/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const query = `
      SELECT 
        stock1,
        stock2,
        covariance
      FROM 
        public.stock_statistics_matrix
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock2 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock1 <> stock2
      ORDER BY 
        stock1, stock2;
    `;
    const result = await pool.query(query, [portfolioId]);
    console.log(result);
    const covarianceMatrix = formatMatrix(result.rows, "covariance");
    res.status(200).json(covarianceMatrix);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Get the correlation matrix of the stocks in a portfolio
router.get("/correlation/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const query = `
      SELECT 
        stock1,
        stock2,
        correlation
      FROM 
        public.stock_statistics_matrix
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock2 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock1 <> stock2
      ORDER BY 
        stock1, stock2;
    `;

    const result = await pool.query(query, [portfolioId]);
    const correlationMatrix = formatMatrix(result.rows, "correlation");
    res.status(200).json(correlationMatrix);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Get the beta of the stocks in a portfolio
router.get("/beta/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  try {
    const query = `
      SELECT 
        stock1,
        stock2,
        beta
      FROM 
        public.stock_statistics_matrix
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock2 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock1 = stock2
      ORDER BY 
        stock1, stock2;
    `;
    const result = await pool.query(query, [portfolioId]);
    const betaMatrix = formatMatrix(result.rows, "beta");
    res.status(200).json(betaMatrix);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.detail });
  }
});

// Helper function to format matrices
const formatMatrix = (rows, metric) => {
  const matrix = {};
  rows.forEach((row) => {
    if (!matrix[row.stock1]) {
      matrix[row.stock1] = {};
    }
    matrix[row.stock1][row.stock2] = row[metric];
  });
  return matrix;
};

export default router;
