-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- Update existing users to have appropriate roles
-- Make the first user (you) an admin
UPDATE users SET role = 'admin' WHERE email = 'maneesh@maneeshmandanna.com';

-- Create index for role queries
CREATE INDEX idx_users_role ON users(role);