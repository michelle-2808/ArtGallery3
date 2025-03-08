
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

-- Create otp_codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add foreign key constraints
ALTER TABLE orders ADD CONSTRAINT fk_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_order 
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT fk_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE cart_items ADD CONSTRAINT fk_cart_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE cart_items ADD CONSTRAINT fk_cart_product 
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE otp_codes ADD CONSTRAINT fk_otp_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_order_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_user ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);

-- Insert admin user
INSERT INTO users (username, password, is_admin) 
VALUES ('amruta', 'Harshal@2808', true)
ON CONFLICT (username) DO NOTHING;

-- Insert products
INSERT INTO products (title, description, price, image_url, category, stock_quantity, is_available) VALUES
-- Paintings
('Modern Abstract', 'Contemporary abstract artwork with bold colors', 12999.00, 'https://images.unsplash.com/photo-1576153192396-180ecef2a715', 'painting', 3, true),
('Landscape Vista', 'Serene landscape painting of mountain ranges', 15999.00, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'painting', 2, true),
('Urban Scene', 'Dynamic cityscape in impressionist style', 8999.00, 'https://images.unsplash.com/photo-1549289524-06cf8837ace5', 'painting', 4, true),
('Abstract Painting', 'A beautiful abstract painting with vibrant colors', 7999.00, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'painting', 5, true),

-- Pottery
('Traditional Vase', 'Hand-thrown ceramic vase with glazed finish', 4999.00, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', 'pottery', 6, true),
('Tea Set Collection', 'Complete ceramic tea set with traditional patterns', 6999.00, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61', 'pottery', 4, true),
('Decorative Bowls', 'Set of 3 handcrafted decorative bowls', 3599.00, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'pottery', 8, true),
('Ceramic Vase', 'Handcrafted ceramic vase with unique patterns', 3599.00, 'https://images.unsplash.com/photo-1578913685467-ef49f9c224b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'pottery', 8, true),

-- Sculptures
('Bronze Figure', 'Contemporary bronze sculpture of human form', 24999.00, 'https://images.unsplash.com/photo-1554188248-986adbb73be4', 'sculpture', 2, true),
('Stone Abstract', 'Modern abstract sculpture in natural stone', 18999.00, 'https://images.unsplash.com/photo-1561839561-b13bcfe95249', 'sculpture', 3, true),
('Metal Art Piece', 'Contemporary metal sculpture for indoor display', 13999.00, 'https://images.unsplash.com/photo-1566145496923-4e026f5a8f0f', 'sculpture', 4, true),
('Wooden Sculpture', 'Hand-carved wooden sculpture from sustainable wood', 9999.00, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'sculpture', 3, true),
('Metal Wall Art', 'Modern metal wall art, perfect for contemporary spaces', 5999.00, 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'sculpture', 4, true),

-- Prints
('Limited Edition Print', 'Numbered art print from original painting', 2499.00, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5', 'print', 10, true),
('Digital Art Series', 'Collection of modern digital art prints', 1999.00, 'https://images.unsplash.com/photo-1561839561-b13bcfe95249', 'print', 15, true),
('Photography Print', 'Fine art photography print on archival paper', 3499.00, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61', 'print', 8, true),
('Digital Art Print', 'Limited edition digital art print, signed by the artist', 2999.00, 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'print', 15, true),

-- Glass Art
('Blown Glass Bowl', 'Handcrafted decorative glass bowl', 7999.00, 'https://images.unsplash.com/photo-1576020886878-f8fc1a748678', 'glass', 3, true),
('Art Glass Sculpture', 'Contemporary sculptural piece in colored glass', 11999.00, 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', 'glass', 2, true),
('Glass Wall Art', 'Decorative wall mounted glass art piece', 9999.00, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa', 'glass', 4, true),
('Glass Ornament', 'Handblown glass ornament with delicate details', 1999.00, 'https://images.unsplash.com/photo-1576020886878-f8fc1a748678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=580&q=80', 'glass', 7, true)
ON CONFLICT DO NOTHING;

-- Note: To execute this file, you can use the following command:
-- psql -U your_username -d your_database -f backup-data.sql
