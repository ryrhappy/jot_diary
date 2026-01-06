-- Jot Diary 用户认证数据迁移脚本（安全版本 - 保留现有数据）
-- 如果您想保留现有数据并分配给特定用户，请使用此脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- ⚠️ 重要提示：
-- 1. 请先创建一个测试用户账户并登录
-- 2. 在 Supabase 的 Authentication > Users 中找到您的用户 ID
-- 3. 将下面的 'YOUR_USER_ID_HERE' 替换为您的实际用户 ID

-- 1. 为 diaries 表添加 user_id 字段（允许 NULL）
ALTER TABLE diaries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 为现有数据分配用户 ID（请替换为您的实际用户 ID）
-- 如果您有多个用户，需要手动为每条记录分配正确的 user_id
UPDATE diaries 
SET user_id = 'YOUR_USER_ID_HERE'::UUID 
WHERE user_id IS NULL;

-- 3. 验证是否还有 NULL 值（如果有，说明上面的 UPDATE 没有完全执行）
-- 如果查询结果不为空，请检查并手动处理剩余的数据
SELECT COUNT(*) as null_count FROM diaries WHERE user_id IS NULL;

-- 4. 如果确认所有数据都已分配 user_id，执行以下语句设置 NOT NULL
-- 如果上一步查询结果 > 0，请不要执行下面的语句，先处理 NULL 数据
ALTER TABLE diaries 
ALTER COLUMN user_id SET NOT NULL;

-- 5. 为 user_id 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);

-- 6. 启用行级安全策略 (RLS)
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 7. 删除旧的公开访问策略（如果存在）
DROP POLICY IF EXISTS "Allow public read and write" ON diaries;

-- 8. 创建新的 RLS 策略：用户只能查看自己的数据
CREATE POLICY "Users can view own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

-- 9. 创建 RLS 策略：用户只能插入自己的数据
CREATE POLICY "Users can insert own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 10. 创建 RLS 策略：用户只能更新自己的数据
CREATE POLICY "Users can update own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. 创建 RLS 策略：用户只能删除自己的数据
CREATE POLICY "Users can delete own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);

-- 验证：检查表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'diaries';

