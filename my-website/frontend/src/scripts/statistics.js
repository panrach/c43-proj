const baseUrl = "http://localhost:3000";

export const fetchCovarianceMatrix = async (portfolioId, startDate, endDate) => {
  try {
    const response = await fetch(
      `${baseUrl}/statistics/covariance/${portfolioId}?startDate=${startDate}&endDate=${endDate}`,
      {
        credentials: "include",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching covariance matrix:", error);
  }
};

export const fetchCorrelationMatrix = async (portfolioId, startDate, endDate) => {
  try {
    const response = await fetch(
      `${baseUrl}/statistics/correlation/${portfolioId}?startDate=${startDate}&endDate=${endDate}`,
      {
        credentials: "include",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching correlation matrix:", error);
  }
};

export const fetchBeta = async (portfolioId, startDate, endDate) => {
  try {
    const response = await fetch(`${baseUrl}/statistics/beta/${portfolioId}?startDate=${startDate}&endDate=${endDate}`, {
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching beta:", error);
  }
};

const formatMatrix = (matrix) => {
  let formatted =
    "<table><tr><th>Stock 1</th><th>Stock 2</th><th>Value</th></tr>";
  for (const stock1 in matrix) {
    for (const stock2 in matrix[stock1]) {
      formatted += `<tr><td>${stock1}</td><td>${stock2}</td><td>${matrix[stock1][stock2]}</td></tr>`;
    }
  }
  formatted += "</table>";
  return formatted;
};

const formatBeta = (beta) => {
  let formatted = "<table><tr><th>Stock</th><th>Beta</th></tr>";
  for (const entry of beta) {
    formatted += `<tr><td>${entry.stock_code}</td><td>${entry.beta.toFixed(6)}</td></tr>`;
  }
  formatted += "</table>";
  return formatted;
};

export const displayStatistics = async (portfolioId, startDate, endDate) => {
  const covarianceMatrix = await fetchCovarianceMatrix(portfolioId, startDate, endDate);
  const correlationMatrix = await fetchCorrelationMatrix(portfolioId, startDate, endDate);
  const beta = await fetchBeta(portfolioId, startDate, endDate);

  document.getElementById("covariance-matrix").innerHTML = `
    <h3>Covariance Matrix</h3>
    ${formatMatrix(covarianceMatrix)}
  `;
  document.getElementById("correlation-matrix").innerHTML = `
    <h3>Correlation Matrix</h3>
    ${formatMatrix(correlationMatrix)}
  `;
  document.getElementById("beta").innerHTML = `
    <h3>Beta</h3>
    ${formatBeta(beta)}
  `;
};
