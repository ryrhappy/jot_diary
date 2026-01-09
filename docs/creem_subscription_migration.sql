-- Creem支付订阅表迁移脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  plan_id VARCHAR(50) NOT NULL, -- 'pro' or 'premium'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'expired'
  creem_customer_id VARCHAR(255),
  creem_subscription_id VARCHAR(255),
  creem_payment_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 确保每个用户只有一个活跃订阅
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

-- 3. 启用行级安全策略 (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. 创建RLS策略：用户只能查看自己的订阅
CREATE POLICY "Users can view own subscriptions"
ON user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- 5. 创建RLS策略：用户只能插入自己的订阅
CREATE POLICY "Users can insert own subscriptions"
ON user_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. 创建RLS策略：用户只能更新自己的订阅
CREATE POLICY "Users can update own subscriptions"
ON user_subscriptions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. 创建RLS策略：系统可以更新订阅（用于Webhook）
-- 注意：这个策略允许服务端更新，但需要谨慎使用
-- 实际使用时，Webhook应该使用服务端密钥，而不是用户认证
-- 这里先创建，实际部署时需要根据Creem Webhook的认证方式调整

-- 8. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 验证：检查表结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_subscriptions';

