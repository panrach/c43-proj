const baseUrl = "http://localhost:3000";

export const fetchCovarianceMatrix = async (portfolioId) => {
  try {
    const response = await fetch(
      `${baseUrl}/statistics/covariance/${portfolioId}`,
      {
        credentials: "include",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching covariance matrix:", error);
  }
};

export const fetchCorrelationMatrix = async (portfolioId) => {
  try {
    const response = await fetch(
      `${baseUrl}/statistics/correlation/${portfolioId}`,
      {
        credentials: "include",
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching correlation matrix:", error);
  }
};

export const fetchBeta = async (portfolioId) => {
  try {
    const response = await fetch(`${baseUrl}/statistics/beta/${portfolioId}`, {
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
  for (const stock1 in beta) {
    for (const stock2 in beta[stock1]) {
      if (stock1 === stock2) {
        formatted += `<tr><td>${stock1}</td><td>${beta[stock1][stock2]}</td></tr>`;
      }
    }
  }
  formatted += "</table>";
  return formatted;
};

export const displayStatistics = async (portfolioId) => {
  const covarianceMatrix = await fetchCovarianceMatrix(portfolioId);
  const correlationMatrix = await fetchCorrelationMatrix(portfolioId);
  const beta = await fetchBeta(portfolioId);

  console.log(covarianceMatrix);
  console.log(correlationMatrix);
  console.log(beta);

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
