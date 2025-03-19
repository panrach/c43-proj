# Backend Documentation

This is the backend part of the my-website project. It is built using Express.js and serves as the API for the frontend application.

## Getting Started

To get started with the backend, follow these steps:

1. **Install Dependencies**: Navigate to the backend directory and run the following command to install the required dependencies:

   ```
   npm install
   ```

2. **Run the Server**: After installing the dependencies, you can start the server with the following command:

   ```
   npm start
   ```

   The server will start on the default port (usually 3000).

## Folder Structure

- **src/**: Contains the source code for the backend application.
  - **app.js**: The main entry point of the application.
  - **routes/**: Contains route definitions.
    - **index.js**: Defines the API routes.

## DB Schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    balance NUMERIC DEFAULT 0
);

CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    timestamp DATE,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    code VARCHAR(10),
    UNIQUE (timestamp, code)
);

CREATE TABLE stock_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    stock_symbol VARCHAR(10) REFERENCES stocks(symbol),
    shares INTEGER NOT NULL,
    UNIQUE (portfolio_id, stock_symbol)
);
```

new schema
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    balance NUMERIC DEFAULT 0
);

CREATE TABLE portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE stocks (
    id SERIAL PRIMARY KEY,
    timestamp DATE,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume BIGINT,
    code VARCHAR(10) NOT NULL
);

CREATE TABLE stock_holdings (
    id SERIAL PRIMARY KEY,
    portfolio_id INTEGER REFERENCES portfolios(id),
    stock_id INTEGER REFERENCES stocks(id),
    shares INTEGER NOT NULL,
    UNIQUE (portfolio_id, stock_id)
);

CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL -- e.g., 'pending', 'accepted'
);

CREATE TABLE stock_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE
);

CREATE TABLE stock_list_items (
    id SERIAL PRIMARY KEY,
    stock_list_id INTEGER REFERENCES stock_lists(id),
    stock_id INTEGER REFERENCES stocks(id),
    UNIQUE (stock_list_id, stock_id)
);

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    stock_list_id INTEGER REFERENCES stock_lists(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

The backend exposes various API endpoints that the frontend can interact with. Refer to the `index.js` file in the routes directory for detailed information on the available endpoints.

## Contributing

If you wish to contribute to the backend, please fork the repository and submit a pull request with your changes. Make sure to follow the coding standards and include tests for new features.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.