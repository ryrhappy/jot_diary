-- ============================================
-- Jot Diary 完整数据库设置脚本
-- 适用于全新安装或重建数据库
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 步骤 1: 创建 diaries 表（包含 user_id 字段）
CREATE TABLE IF NOT EXISTS diaries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  time TEXT NOT NULL,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 步骤 2: 为 user_id 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);

-- 步骤 3: 为 date 和 created_at 创建索引以提高排序和查询性能
CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date DESC);
CREATE INDEX IF NOT EXISTS idx_diaries_created_at ON diaries(created_at DESC);

-- 步骤 4: 启用行级安全策略 (RLS)
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- 步骤 5: 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Allow public read and write" ON diaries;
DROP POLICY IF EXISTS "Users can view own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can insert own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can update own diaries" ON diaries;
DROP POLICY IF EXISTS "Users can delete own diaries" ON diaries;

-- 步骤 6: 创建 RLS 策略 - 用户只能查看自己的数据
CREATE POLICY "Users can view own diaries"
ON diaries FOR SELECT
USING (auth.uid() = user_id);

-- 步骤 7: 创建 RLS 策略 - 用户只能插入自己的数据
CREATE POLICY "Users can insert own diaries"
ON diaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 步骤 8: 创建 RLS 策略 - 用户只能更新自己的数据
CREATE POLICY "Users can update own diaries"
ON diaries FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 步骤 9: 创建 RLS 策略 - 用户只能删除自己的数据
CREATE POLICY "Users can delete own diaries"
ON diaries FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- 验证步骤（可选，用于检查表结构）
-- ============================================
-- 执行以下查询验证表结构：
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'diaries'
-- ORDER BY ordinal_position;

-- 执行以下查询验证 RLS 策略：
-- SELECT 
--   schemaname,
--   tablename,
--   policyname,
--   permissive,
--   roles,
--   cmd,
--   qual,
--   with_check
-- FROM pg_policies 
-- WHERE tablename = 'diaries';

