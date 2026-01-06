-- 修复迁移错误：处理现有的 NULL 数据
-- 如果执行迁移时遇到 "contains null values" 错误，请先执行此脚本

-- 选项 1：删除所有匿名数据（如果这些是测试数据，可以删除）
DELETE FROM diaries WHERE user_id IS NULL;

-- 选项 2：如果您想保留数据并分配给特定用户，请先执行以下查询获取您的用户 ID：
-- SELECT id, email FROM auth.users;
-- 然后将下面的 'YOUR_USER_ID_HERE' 替换为您的实际用户 ID，并取消注释：
-- UPDATE diaries SET user_id = 'YOUR_USER_ID_HERE'::UUID WHERE user_id IS NULL;

-- 验证：检查是否还有 NULL 值
SELECT COUNT(*) as null_count FROM diaries WHERE user_id IS NULL;
-- 如果结果为 0，说明所有数据都已处理，可以继续执行主迁移脚本的步骤 3

-- 如果上一步结果为 0，现在可以设置 NOT NULL 约束：
ALTER TABLE diaries 
ALTER COLUMN user_id SET NOT NULL;

