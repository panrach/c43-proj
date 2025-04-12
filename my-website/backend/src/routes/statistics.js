import express from "express";
import pool from "../../config/dbConfig.js";

const router = express.Router();

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

// Calculate and cache covariance
const calculateAndCacheCovariance = async (portfolioId, startDate, endDate) => {
  const query = `
    INSERT INTO stock_statistics (stock1, stock2, covariance, start_date, end_date)
    SELECT 
      dr1.stock_code AS stock1,
      dr2.stock_code AS stock2,
      COVAR_POP(dr1.daily_return, dr2.daily_return) AS covariance,
      $2 AS start_date,
      $3 AS end_date
    FROM 
      (
        SELECT 
          sh.stock_code,
          (s.close - LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp)) / 
          LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp) AS daily_return
        FROM 
          stock_holdings sh
        JOIN 
          stocks s ON sh.stock_code = s.code
        WHERE 
          sh.portfolio_id = $1
          AND s.timestamp BETWEEN $2 AND $3
      ) dr1
    JOIN 
      (
        SELECT 
          sh.stock_code,
          (s.close - LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp)) / 
          LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp) AS daily_return
        FROM 
          stock_holdings sh
        JOIN 
          stocks s ON sh.stock_code = s.code
        WHERE 
          sh.portfolio_id = $1
          AND s.timestamp BETWEEN $2 AND $3
      ) dr2
    ON 
      dr1.stock_code < dr2.stock_code -- Avoid duplicates
    GROUP BY 
      dr1.stock_code, dr2.stock_code
    HAVING 
      COUNT(dr1.daily_return) > 1 AND COUNT(dr2.daily_return) > 1 -- Ensure sufficient data points
    ON CONFLICT (stock1, stock2, start_date, end_date)
    DO UPDATE SET covariance = EXCLUDED.covariance
    WHERE stock_statistics.covariance IS NULL;
  `;
  await pool.query(query, [portfolioId, startDate, endDate]);
};

// Get the covariance matrix of the stocks in a portfolio
router.get("/covariance/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  const { startDate, endDate } = req.query;

  // Default startDate to 50 years ago and endDate to today
  if (!startDate) {
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    startDate = fiftyYearsAgo.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }
  if (!endDate) {
    endDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }

  try {
    const query = `
      SELECT 
        stock1,
        stock2,
        covariance
      FROM 
        stock_statistics
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock2 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND start_date = $2
        AND end_date = $3
        AND stock1 <> stock2
      ORDER BY 
        stock1, stock2;
    `;
    const result = await pool.query(query, [portfolioId, startDate, endDate]);

    // Check if any of the covariance values are null
    const containsNull = result.rows.some(row => row.covariance === null);

    // If no cached data or if any value is null, recalculate and cache it
    if (containsNull || result.rows.length === 0) {
      await calculateAndCacheCovariance(portfolioId, startDate, endDate);
      const cachedResult = await pool.query(query, [portfolioId, startDate, endDate]);
      const covarianceMatrix = formatMatrix(cachedResult.rows, "covariance");
      return res.status(200).json(covarianceMatrix);
    }

    const covarianceMatrix = formatMatrix(result.rows, "covariance");
    res.status(200).json(covarianceMatrix);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Calculate and cache correlation
const calculateAndCacheCorrelation = async (portfolioId, startDate, endDate) => {
  const query = `
    INSERT INTO stock_statistics (stock1, stock2, correlation, start_date, end_date)
    SELECT 
      dr1.stock_code AS stock1,
      dr2.stock_code AS stock2,
      CORR(dr1.daily_return, dr2.daily_return) AS correlation,
      $2 AS start_date,
      $3 AS end_date
    FROM 
      (
        SELECT 
          sh.stock_code,
          (s.close - LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp)) / 
          LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp) AS daily_return
        FROM 
          stock_holdings sh
        JOIN 
          stocks s ON sh.stock_code = s.code
        WHERE 
          sh.portfolio_id = $1
          AND s.timestamp BETWEEN $2 AND $3
      ) dr1
    JOIN 
      (
        SELECT 
          sh.stock_code,
          (s.close - LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp)) / 
          LAG(s.close) OVER (PARTITION BY s.code ORDER BY s.timestamp) AS daily_return
        FROM 
          stock_holdings sh
        JOIN 
          stocks s ON sh.stock_code = s.code
        WHERE 
          sh.portfolio_id = $1
          AND s.timestamp BETWEEN $2 AND $3
      ) dr2
    ON 
      dr1.stock_code < dr2.stock_code -- Avoid duplicates
    GROUP BY 
      dr1.stock_code, dr2.stock_code
    HAVING 
      COUNT(dr1.daily_return) > 1 AND COUNT(dr2.daily_return) > 1 -- Ensure sufficient data points
    ON CONFLICT (stock1, stock2, start_date, end_date)
    DO UPDATE SET correlation = EXCLUDED.correlation
    WHERE stock_statistics.correlation IS NULL;
  `;
  await pool.query(query, [portfolioId, startDate, endDate]);
};

// Get the correlation matrix of the stocks in a portfolio
router.get("/correlation/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  const { startDate, endDate } = req.query;

  // Default startDate to 50 years ago and endDate to today
  if (!startDate) {
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    startDate = fiftyYearsAgo.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }
  if (!endDate) {
    endDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }
  

  try {
    const query = `
      SELECT 
        stock1,
        stock2,
        correlation
      FROM 
        stock_statistics
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock2 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND start_date = $2
        AND end_date = $3
        AND stock1 <> stock2
      ORDER BY 
        stock1, stock2;
    `;
    const result = await pool.query(query, [portfolioId, startDate, endDate]);

    // Check if any of the correlation values are null
    const containsNull = result.rows.some(row => row.correlation === null);

    // If no cached data or if any value is null, recalculate and cache it
    if (containsNull || result.rows.length === 0) {
      await calculateAndCacheCorrelation(portfolioId, startDate, endDate);
      const cachedResult = await pool.query(query, [portfolioId, startDate, endDate]);
      const correlationMatrix = formatMatrix(cachedResult.rows, "correlation");
      return res.status(200).json(correlationMatrix);
    }

    const correlationMatrix = formatMatrix(result.rows, "correlation");
    res.status(200).json(correlationMatrix);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const calculateAndCacheBeta = async (portfolioId, startDate, endDate) => {
  const query = `
    INSERT INTO stock_statistics (stock1, stock2, beta, start_date, end_date)
    WITH daily_market_avg_close AS (
      -- Compute the daily market average close price
      SELECT s."timestamp", 
             AVG(s."close") AS market_close
      FROM stocks s
      WHERE s.timestamp BETWEEN $2 AND $3
      GROUP BY s."timestamp"
    ), daily_pairs AS (
      -- Pair up stocks by matching timestamps
      SELECT s1.code AS stock1,
             s1.code AS stock2,  -- Self-pairing for beta calculation
             s1."close" AS close1,
             m.market_close AS close2
      FROM stocks s1
      JOIN daily_market_avg_close m 
        ON s1."timestamp" = m."timestamp"
      WHERE s1.code IN (
        SELECT stock_code 
        FROM stock_holdings 
        WHERE portfolio_id = $1
      )
      AND s1.timestamp BETWEEN $2 AND $3
    )
    -- Compute beta
    SELECT 
      stock1, 
      stock2, 
      COVAR_POP(close1::double precision, close2::double precision) / 
      NULLIF(VAR_POP(close2::double precision), 0) AS beta,
      $2 AS start_date,
      $3 AS end_date
    FROM daily_pairs
    GROUP BY stock1, stock2
    HAVING 
      COUNT(close1) > 1 AND COUNT(close2) > 1 -- Ensure sufficient data points
    ON CONFLICT (stock1, stock2, start_date, end_date)
    DO UPDATE SET beta = EXCLUDED.beta
    WHERE stock_statistics.beta IS NULL;
  `;
  await pool.query(query, [portfolioId, startDate, endDate]);
};

const formatBeta = (rows) => {
  console.log("Formatting beta rows:", rows);
  return rows.map(row => ({
    stock_code: row.stock_code,
    beta: parseFloat(row.beta) // Convert beta from string to a float
  }));
};

// Get the beta of the stocks in a portfolio
router.get("/beta/:portfolioId", async (req, res) => {
  const { portfolioId } = req.params;
  const { startDate, endDate } = req.query;


    // Default startDate to 50 years ago and endDate to today
    if (!startDate) {
      const fiftyYearsAgo = new Date();
      fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
      startDate = fiftyYearsAgo.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    }
    if (!endDate) {
      endDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD
    }

  try {
    const query = `
      SELECT 
        stock1 AS stock_code,
        beta
      FROM 
        stock_statistics
      WHERE 
        stock1 IN (SELECT stock_code FROM stock_holdings WHERE portfolio_id = $1)
        AND stock1 = stock2 -- Ensure beta is for self-pairing (stock relative to itself)
        AND start_date = $2
        AND end_date = $3
      ORDER BY 
        stock1;
    `;
    const result = await pool.query(query, [portfolioId, startDate, endDate]);

    // Check if any of the beta values are null or if no results are returned
    const containsNull = result.rows.some(row => row.beta === null);

    if (containsNull || result.rows.length === 0) {
      // Recalculate and cache beta if necessary
      await calculateAndCacheBeta(portfolioId, startDate, endDate);
      const cachedResult = await pool.query(query, [portfolioId, startDate, endDate]);
      return res.status(200).json(formatBeta(cachedResult.rows));
    }

    res.status(200).json(formatBeta(result.rows));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
