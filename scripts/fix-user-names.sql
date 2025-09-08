-- DEPRECATED: Fix test user names to use Tourista naming
-- Use the modern JavaScript version instead: scripts/fix-users-direct.js
-- Update admin user
UPDATE "User" SET name = 'Tourista A' WHERE email = 'admin@test.com';

-- Update profesor user
UPDATE "User" SET name = 'Tourista B' WHERE email = 'profesor@test.com';

-- Update parent user
UPDATE "User" SET name = 'Tourista C' WHERE email = 'parent@test.com';

-- Update any users that might have "Emergency" or old names
UPDATE "User" SET name = 'Tourista A' WHERE name LIKE '%Emergency%' AND role = 'ADMIN';
UPDATE "User" SET name = 'Tourista B' WHERE name LIKE '%Emergency%' AND role = 'PROFESOR';
UPDATE "User" SET name = 'Tourista C' WHERE name LIKE '%Emergency%' AND role = 'PARENT';

-- Show updated users
SELECT email, name, role FROM "User" WHERE email IN ('admin@test.com', 'profesor@test.com', 'parent@test.com', 'agustinaramac@gmail.com');