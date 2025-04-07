# Backend Documentation

This is the backend part of the my-website project. It is built using Express.js and serves as the API for the frontend application.

## Getting Started

To get started with the backend, follow these steps:

1. **Install Dependencies**: Navigate to the backend directory and run the following command to install the required dependencies:

   ```
   npm install
   ```

2. **Create the env file in ./backend/db**
```txt
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PWD=yourpassword
PG_DB=mydb
```

3. Run the DB migration as described in the DB Schema section

4. Go back to ./my-website/README.md and continue the setup

## DB Schema

```sql
CREATE TABLE stock_statistics (
	id serial4 NOT NULL,
	stock1 varchar(10) NOT NULL,
	stock2 varchar(10) NOT NULL,
	covariance numeric NULL,
	correlation numeric NULL,
	beta numeric NULL,
	start_date date NOT NULL,
	end_date date NOT NULL,
	CONSTRAINT stock_statistics_pkey PRIMARY KEY (id),
	CONSTRAINT stock_statistics_stock1_stock2_check CHECK ((((stock1)::text <> (stock2)::text) OR (beta IS NOT NULL))),
	CONSTRAINT stock_statistics_time_range_unique UNIQUE (stock1, stock2, start_date, end_date),
	CONSTRAINT stock_statistics_unique UNIQUE (stock1, stock2, start_date, end_date)
);

CREATE TABLE stocks (
	id serial4 NOT NULL,
	"timestamp" date NULL,
	"open" numeric NULL,
	high numeric NULL,
	low numeric NULL,
	"close" numeric NULL,
	volume int8 NULL,
	code varchar(10) NOT NULL,
	CONSTRAINT stocks_pkey PRIMARY KEY (id)
);

CREATE TABLE users (
	id serial4 NOT NULL,
	username varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	email varchar(100) NOT NULL,
	balance numeric DEFAULT 0 NULL,
	CONSTRAINT users_email_key UNIQUE (email),
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username)
);

CREATE TABLE friends (
	id serial4 NOT NULL,
	user_id int4 NULL,
	friend_id int4 NULL,
	status varchar(20) NOT NULL,
	CONSTRAINT friends_pkey PRIMARY KEY (id),
	CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES users(id),
	CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE portfolios (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT portfolios_pkey PRIMARY KEY (id),
	CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE stock_holdings (
	id serial4 NOT NULL,
	portfolio_id int4 NULL,
	stock_code varchar(10) NULL,
	shares int4 NOT NULL,
	CONSTRAINT stock_holdings_pkey PRIMARY KEY (id),
	CONSTRAINT stock_holdings_portfolio_id_stock_code_key UNIQUE (portfolio_id, stock_code),
	CONSTRAINT stock_holdings_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

CREATE TABLE stock_lists (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"name" varchar(100) NOT NULL,
	is_public bool DEFAULT false NULL,
	CONSTRAINT stock_lists_pkey PRIMARY KEY (id),
	CONSTRAINT stock_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE transactions (
	id serial4 NOT NULL,
	user_id int4 NOT NULL,
	"type" varchar(50) NOT NULL,
	amount numeric NOT NULL,
	stock_code varchar(10) NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT transactions_pkey PRIMARY KEY (id),
	CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE reviews (
	id serial4 NOT NULL,
	stock_list_id int4 NULL,
	user_id int4 NULL,
	"comment" text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT reviews_pkey PRIMARY KEY (id),
	CONSTRAINT reviews_stock_list_id_fkey FOREIGN KEY (stock_list_id) REFERENCES stock_lists(id),
	CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE shared_stock_lists (
	id serial4 NOT NULL,
	stock_list_id int4 NOT NULL,
	friend_id int4 NOT NULL,
	CONSTRAINT shared_stock_lists_pkey PRIMARY KEY (id),
	CONSTRAINT shared_stock_lists_unique UNIQUE (stock_list_id, friend_id),
	CONSTRAINT shared_stock_lists_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT shared_stock_lists_stock_list_id_fkey FOREIGN KEY (stock_list_id) REFERENCES stock_lists(id) ON DELETE CASCADE
);

CREATE TABLE stock_list_items (
	id serial4 NOT NULL,
	stock_list_id int4 NULL,
	stock_id int4 NULL,
	CONSTRAINT stock_list_items_pkey PRIMARY KEY (id),
	CONSTRAINT stock_list_items_stock_list_id_stock_id_key UNIQUE (stock_list_id, stock_id),
	CONSTRAINT stock_list_items_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES stocks(id),
	CONSTRAINT stock_list_items_stock_list_id_fkey FOREIGN KEY (stock_list_id) REFERENCES stock_lists(id)
);
```
