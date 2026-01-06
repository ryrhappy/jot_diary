-- ============================================
-- 快速修复：手动确认所有用户的邮箱
-- 如果禁用邮箱验证后，现有用户仍无法登录，执行此脚本
-- ============================================

-- 方法 1: 确认所有未验证用户的邮箱
UPDATE auth.users 
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 方法 2: 如果您想查看哪些用户未验证
-- SELECT id, email, email_confirmed_at, created_at 
-- FROM auth.users 
-- WHERE email_confirmed_at IS NULL;

-- 方法 3: 确认特定用户的邮箱（替换 YOUR_EMAIL_HERE）
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'YOUR_EMAIL_HERE' AND email_confirmed_at IS NULL;

