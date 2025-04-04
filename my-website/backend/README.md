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
-- public.stocks definition

-- Drop table

-- DROP TABLE stocks;

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


-- public.users definition

-- Drop table

-- DROP TABLE users;

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


-- public.friends definition

-- Drop table

-- DROP TABLE friends;

CREATE TABLE friends (
	id serial4 NOT NULL,
	user_id int4 NULL,
	friend_id int4 NULL,
	status varchar(20) NOT NULL,
	CONSTRAINT friends_pkey PRIMARY KEY (id),
	CONSTRAINT friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES users(id),
	CONSTRAINT friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);


-- public.portfolios definition

-- Drop table

-- DROP TABLE portfolios;

CREATE TABLE portfolios (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT portfolios_pkey PRIMARY KEY (id),
	CONSTRAINT portfolios_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);


-- public.stock_holdings definition

-- Drop table

-- DROP TABLE stock_holdings;

CREATE TABLE stock_holdings (
	id serial4 NOT NULL,
	portfolio_id int4 NULL,
	stock_code varchar(10) NULL,
	shares int4 NOT NULL,
	CONSTRAINT stock_holdings_pkey PRIMARY KEY (id),
	CONSTRAINT stock_holdings_portfolio_id_stock_code_key UNIQUE (portfolio_id, stock_code),
	CONSTRAINT stock_holdings_portfolio_id_fkey FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);


-- public.stock_lists definition

-- Drop table

-- DROP TABLE stock_lists;

CREATE TABLE stock_lists (
	id serial4 NOT NULL,
	user_id int4 NULL,
	"name" varchar(100) NOT NULL,
	is_public bool DEFAULT false NULL,
	CONSTRAINT stock_lists_pkey PRIMARY KEY (id),
	CONSTRAINT stock_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);


-- public.reviews definition

-- Drop table

-- DROP TABLE reviews;

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


-- public.stock_list_items definition

-- Drop table

-- DROP TABLE stock_list_items;

CREATE TABLE stock_list_items (
	id serial4 NOT NULL,
	stock_list_id int4 NULL,
	stock_id int4 NULL,
	CONSTRAINT stock_list_items_pkey PRIMARY KEY (id),
	CONSTRAINT stock_list_items_stock_list_id_stock_id_key UNIQUE (stock_list_id, stock_id),
	CONSTRAINT stock_list_items_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES stocks(id),
	CONSTRAINT stock_list_items_stock_list_id_fkey FOREIGN KEY (stock_list_id) REFERENCES stock_lists(id)
);

CREATE TABLE shared_stock_lists (
    id SERIAL PRIMARY KEY, -- Unique identifier for each shared record
    stock_list_id INT NOT NULL, -- References the stock list being shared
    friend_id INT NOT NULL, -- References the user (friend) with whom the stock list is shared
    CONSTRAINT shared_stock_lists_stock_list_id_fkey FOREIGN KEY (stock_list_id) REFERENCES stock_lists(id) ON DELETE CASCADE,
    CONSTRAINT shared_stock_lists_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT shared_stock_lists_unique UNIQUE (stock_list_id, friend_id) -- Prevent duplicate sharing
);

```
