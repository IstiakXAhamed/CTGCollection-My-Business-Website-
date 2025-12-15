-- Admin Hierarchy Migration Script
-- Run this AFTER running `npx prisma db push` to update schema

-- Make the first admin user a superadmin (run this manually if you have existing admin)
-- Replace 'your-admin-email@example.com' with actual admin email

-- Option 1: Upgrade first created admin to superadmin
UPDATE User SET role = 'superadmin' WHERE role = 'admin' ORDER BY createdAt ASC LIMIT 1;

-- Option 2: Upgrade specific email to superadmin (recommended)
-- UPDATE User SET role = 'superadmin' WHERE email = 'admin@ctgcollection.com';

-- Set isActive to true for all existing users (in case column added as null)
UPDATE User SET isActive = 1 WHERE isActive IS NULL;

-- Verify the changes
SELECT id, email, name, role, isActive, createdAt FROM User ORDER BY role DESC;
