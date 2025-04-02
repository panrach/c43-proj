const baseUrl = "http://localhost:3000";

export const fetchTransactions = async (portfolioId) => {
  try {
    const response = await fetch(`${baseUrl}/transactions/${portfolioId}`, {
      credentials: "include", // Include credentials for session handling
    });
    const transactions = await response.json();

    if (response.ok) {
      return transactions;
    } else {
      alert(transactions.error || "Error fetching transactions");
      return [];
    }
  } catch (err) {
    console.error("Error fetching transactions:", err);
    return [];
  }
};

export const displayTransactions = async (portfolioId) => {
  const transactions = await fetchTransactions(portfolioId);
  const transactionsList = document.getElementById("transactions-list");
  transactionsList.innerHTML = ""; // Clear previous transactions

  if (transactions.length === 0) {
    transactionsList.innerHTML =
      "<p>No transactions found for this portfolio.</p>";
    return;
  }

  transactions.forEach((transaction) => {
    const li = document.createElement("li");
    const amount = parseFloat(transaction.amount); // Ensure amount is a number
    li.textContent = `${transaction.type.toUpperCase()} - $${amount.toFixed(
      2
    )} - ${transaction.stock_code || "N/A"} - ${new Date(
      transaction.timestamp
    ).toLocaleString()}`;
    transactionsList.appendChild(li);
  });
};