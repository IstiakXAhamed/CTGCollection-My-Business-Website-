-- Update all product variants to have stock = 100
UPDATE ProductVariant SET stock = 100 WHERE stock = 0 OR stock IS NULL;

-- Verify the update
SELECT id, productId, size, color, stock FROM ProductVariant;
