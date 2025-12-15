-- Quick database check - Run this to see if reviews exist
-- Copy and paste into Prisma Studio SQL tab

-- 1. Check if Review table has data
SELECT COUNT(*) as total_reviews FROM Review;

-- 2. Show all reviews
SELECT 
  r.id,
  r.rating,
  r.comment,
  r.isApproved,
  p.name as product_name,
  p.slug as product_slug,
  u.name as user_name
FROM Review r
JOIN Product p ON r.productId = p.id
JOIN User u ON r.userId = u.id
ORDER BY r.createdAt DESC;

-- 3. Check products
SELECT id, name, slug FROM Product LIMIT 5;

-- 4. Check users
SELECT id, name, email, role FROM User;
