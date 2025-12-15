-- Verify Review Data in Database
-- Run this in Prisma Studio or any SQLite client

-- 1. Count total reviews
SELECT COUNT(*) as total_reviews FROM Review;

-- 2. Show all reviews with product and user info
SELECT 
  r.id,
  r.rating,
  r.comment,
  r.isApproved,
  r.createdAt,
  u.name as reviewer_name,
  u.email as reviewer_email,
  p.name as product_name,
  p.slug as product_slug
FROM Review r
JOIN User u ON r.userId = u.id
JOIN Product p ON r.productId = p.id
ORDER BY r.createdAt DESC;

-- 3. Reviews by product
SELECT 
  p.name as product,
  p.slug,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM Product p
LEFT JOIN Review r ON p.id = r.productId
GROUP BY p.id, p.name, p.slug
HAVING review_count > 0
ORDER BY review_count DESC;

-- 4. Rating distribution
SELECT 
  rating,
  COUNT(*) as count
FROM Review
GROUP BY rating
ORDER BY rating DESC;

-- 5. Reviewer names (should see our new users)
SELECT DISTINCT
  u.name,
  u.email,
  COUNT(r.id) as reviews_written
FROM User u
JOIN Review r ON u.id = r.userId
GROUP BY u.id, u.name, u.email
ORDER BY reviews_written DESC;
