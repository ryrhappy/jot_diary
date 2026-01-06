-- Jot Diary 用户认证数据迁移脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 为 diaries 表添加 user_id 字段（允许 NULL，稍后会处理）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 处理现有数据：删除所有 user_id 为 NULL 的数据
-- 注意：这些是匿名数据，无法关联到用户，所以删除它们
-- 如果您想保留这些数据并分配给特定用户，请先执行：
-- UPDATE diaries SET user_id = 'YOUR_USER_ID' WHERE user_id IS NULL;
-- 然后再执行下面的 DELETE 语句（如果还有 NULL 值）
DELETE FROM diaries WHERE user_id IS NULL;

-- 3. 将 user_id 设置为必填字段（现在所有数据都有 user_id 了）
ALTER TABLE diaries 
ALTER COLUMN user_id SET NOT NULL;

-- 4. 为 user_id 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);

-- 5. 启用行级安全策略 (RLS)
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 6. 删除旧的公开访问策略（如果存在）
DROP POLICY IF EXISTS "Allow public read and write" ON diaries;

-- 7. 创建新的 RLS 策略：用户只能查看自己的数据
CREATE POLICY "Users can view own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

-- 8. 创建 RLS 策略：用户只能插入自己的数据
CREATE POLICY "Users can insert own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. 创建 RLS 策略：用户只能更新自己的数据
CREATE POLICY "Users can update own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. 创建 RLS 策略：用户只能删除自己的数据
CREATE POLICY "Users can delete own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);

-- 验证：检查表结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'diaries';

