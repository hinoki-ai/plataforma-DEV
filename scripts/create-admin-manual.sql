-- DEPRECATED: Manual SQL script to create admin user for production
-- This script contains hardcoded passwords and is no longer recommended
-- Use the TypeScript scripts instead: create-admin.ts or seed-production.ts
--
-- Run this directly against the PostgreSQL database

-- First, check if the user already exists
SELECT id, name, email, role FROM users WHERE email = 'inacorgan@gmail.com';

-- If the user doesn't exist, create them
-- Note: You'll need to replace 'HASHED_PASSWORD_HERE' with the actual hashed password
-- You can generate it using: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('lilo1308', 12));"

INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Andreina Giovanna Salazar Nuñez',
  'inacorgan@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3VxE8qXaXa', -- This is the hash for 'lilo1308'
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Also create backup admin user
INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Administrador Backup',
  'admin@manitospintadas.cl',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3VxE8qXaXa', -- This is the hash for 'admin123'
  'ADMIN',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();

-- Verify the users were created
SELECT id, name, email, role, "isActive" FROM users WHERE email IN ('inacorgan@gmail.com', 'admin@manitospintadas.cl');