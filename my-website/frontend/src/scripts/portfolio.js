const baseUrl = 'http://localhost:3000';

export const fetchPortfolioValue = async (portfolioId) => {
    try {
        
        const response = await fetch(`${baseUrl}/portfolio/${portfolioId}/value`, {
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.json();
        if (response.ok) {
            return parseFloat(result.marketValue).toFixed(2); // Round to 2 decimal places
        } else {
            alert(result.error || 'Error fetching portfolio value');
            return 0;
        }
    }
    catch (error) {
        console.error('Error fetching portfolio value:', error);
    }
};


export const fetchPortfolios = async (userId, portfolioList, handlePortfolioClick) => {
    try {
        const response = await fetch(`${baseUrl}/portfolio/user/${userId}`, {
            credentials: 'include' // Include credentials for session handling
        });
        const portfolios = await response.json();
        portfolioList.innerHTML = '';

        for (const portfolio of portfolios) {
            const marketValue = await fetchPortfolioValue(portfolio.id);
            console.log('Market Value:', marketValue);
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="portfolio-header">${portfolio.name}</div>
                <div class="portfolio-value">Market Value: $${marketValue}</div>
                <div class="stock-section" style="display: none;">
                    <ul class="stock-list"></ul>
                </div>
            `;
            li.querySelector('.portfolio-header').addEventListener('click', () => handlePortfolioClick(portfolio.id, li));
            portfolioList.appendChild(li);
        }
    } catch (error) {
        console.error('Error fetching portfolios:', error);
    }
};

export const createPortfolio = async (e, userId, fetchPortfolios, handlePortfolioClick) => {
    e.preventDefault();
    const name = document.getElementById('portfolio-name').value;
    try {
        const response = await fetch(`${baseUrl}/portfolio/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, name }),
            credentials: 'include' // Include credentials for session handling
        });
        if (response.ok) {
            fetchPortfolios(userId, document.getElementById('portfolio-list'), handlePortfolioClick); // Refresh the portfolio list
        } else {
            alert('Error creating portfolio');
        }
    } catch (error) {
        console.error('Error creating portfolio:', error);
    }
};

export const depositCash = async (e, userId) => {
    e.preventDefault();
    const amount = document.getElementById('deposit-amount').value;
    try {
        const response = await fetch(`${baseUrl}/portfolio/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, amount }),
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('cash-balance').innerText = `Cash Balance: $${result.balance}`;
        } else {
            alert(result.error || 'Deposit failed');
        }
    } catch (error) {
        console.error('Error depositing cash:', error);
    }
};

export const withdrawCash = async (e, userId) => {
    e.preventDefault();
    const amount = document.getElementById('withdraw-amount').value;
    try {
        const response = await fetch(`${baseUrl}/portfolio/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, amount }),
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('cash-balance').innerText = `Cash Balance: $${result.balance}`;
        } else {
            alert(result.error || 'Withdrawal failed');
        }
    } catch (error) {
        console.error('Error withdrawing cash:', error);
    }
};

export const fetchUserCash = async (userId) => {
    try {
        const response = await fetch(`${baseUrl}/portfolio/${userId}/balance/`, {
            credentials: 'include' // Include credentials for session handling
        });
        const result = await response.json();
        if (response.ok) {
            document.getElementById('cash-balance').innerText = `Cash Balance: $${result.cash}`;
            return result.balance;
        } else {
            alert(result.error || 'Error fetching cash balance');
            return 0;
        }
    } catch (error) {
        console.error('Error fetching cash balance:', error);
        return 0;
    }
};