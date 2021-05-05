DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS food_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;


CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone_number INTEGER NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE categories (
id SERIAL PRIMARY KEY NOT NULL,
name VARCHAR(255) NOT NULL
);

CREATE TABLE food_items (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(255) NOT NULL,
  price DECIMAL(4,2) NOT NULL,
  ingredients TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_picked_up BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY NOT NULL,
  food_item_id INTEGER REFERENCES food_items(id) ON DELETE CASCADE,
  quantity SMALLINT NOT NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE
);

