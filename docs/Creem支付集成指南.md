# Creem支付集成指南

## 概述

本文档说明如何在Jot Diary项目中配置和使用Creem支付系统。

## 前置条件

1. 注册Creem账户：访问 [Creem官网](https://creem.io) 并创建账户
2. 获取API密钥：在Creem控制台的"开发者" → "API密钥"页面获取
3. 配置Webhook：在Creem控制台设置Webhook URL

## 环境变量配置

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下环境变量：

```bash
# Creem支付配置
CREEM_API_KEY=ck_test_xxxxxxxxxxxxx  # 或 ck_live_xxxxxxxxxxxxx (生产环境)
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Webhook密钥

# Creem产品ID（在Creem控制台创建产品后获取）
NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO=prod_xxxxxxxxxxxxx
NEXT_PUBLIC_CREEM_PRODUCT_ID_PREMIUM=prod_xxxxxxxxxxxxx

# Creem API基础URL（可选，默认自动检测）
NEXT_PUBLIC_CREEM_API_BASE=https://api.creem.io

# 应用URL（用于支付回调）
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 环境变量说明

- **CREEM_API_KEY**: Creem API密钥
  - 测试环境：以 `ck_test_` 开头
  - 生产环境：以 `ck_live_` 开头
  - 测试环境会自动使用 `https://test-api.creem.io`
  
- **CREEM_WEBHOOK_SECRET**: Webhook签名密钥，用于验证Webhook请求的合法性

- **NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO**: Pro套餐的产品ID（在Creem控制台创建产品后获取）

- **NEXT_PUBLIC_CREEM_PRODUCT_ID_PREMIUM**: Premium套餐的产品ID

- **NEXT_PUBLIC_APP_URL**: 应用的完整URL，用于支付成功/取消后的回调

## 数据库设置

### 1. 执行数据库迁移

在Supabase的 **SQL Editor** 中执行 `docs/creem_subscription_migration.sql` 文件中的所有SQL语句。

这个脚本会：
- 创建 `user_subscriptions` 表用于存储用户订阅信息
- 设置行级安全策略（RLS）确保数据隔离
- 创建必要的索引和触发器

### 2. 验证表结构

执行以下SQL验证表是否创建成功：

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions';
```

## Creem控制台配置

### 1. 创建产品

在Creem控制台的"产品"页面创建两个产品：

- **Pro套餐产品**
  - 名称：Jot Diary Pro
  - 类型：订阅（subscription）或一次性（one_time）
  - 价格：根据你的定价设置
  - 复制产品ID，设置为 `NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO`

- **Premium套餐产品**
  - 名称：Jot Diary Premium
  - 类型：订阅（subscription）或一次性（one_time）
  - 价格：根据你的定价设置
  - 复制产品ID，设置为 `NEXT_PUBLIC_CREEM_PRODUCT_ID_PREMIUM`

### 2. 配置Webhook

在Creem控制台的"Webhooks"页面：

1. 添加Webhook URL：`https://your-domain.com/api/creem/webhook`
2. 选择要监听的事件：
   - `payment.succeeded`
   - `payment.failed`
   - `checkout.session.completed`
   - `checkout.session.failed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
3. 复制Webhook密钥，设置为 `CREEM_WEBHOOK_SECRET`

### 3. 本地开发Webhook测试

本地开发时，可以使用以下工具接收Webhook：

- [ngrok](https://ngrok.com/)：创建本地隧道
- [Creem Webhook测试工具](https://docs.creem.io/webhooks/testing)

示例ngrok命令：
```bash
ngrok http 3000
# 将生成的URL配置到Creem Webhook设置中
```

## 支付流程

### 用户支付流程

1. 用户访问定价页面 (`/pricing`)
2. 点击"立即升级"按钮
3. 如果未登录，弹出登录/注册模态框
4. 登录后，调用 `/api/creem/checkout` 创建支付会话
5. 跳转到Creem支付页面
6. 用户完成支付后，Creem重定向回应用
7. Webhook通知应用支付结果，更新订阅状态

### API端点

#### 创建支付会话

**POST** `/api/creem/checkout`

请求头：
```
Authorization: Bearer <supabase_session_token>
Content-Type: application/json
```

请求体：
```json
{
  "productId": "prod_xxxxxxxxxxxxx",
  "planId": "pro"
}
```

响应：
```json
{
  "sessionId": "sess_xxxxxxxxxxxxx",
  "checkoutUrl": "https://checkout.creem.io/..."
}
```

#### Webhook处理

**POST** `/api/creem/webhook`

此端点由Creem自动调用，无需手动调用。

## 代码结构

```
src/
├── lib/
│   └── creem.ts                    # Creem工具函数和类型定义
├── app/
│   └── api/
│       └── creem/
│           ├── checkout/
│           │   └── route.ts         # 创建支付会话API
│           └── webhook/
│               └── route.ts         # Webhook处理API
└── components/
    └── pricing/
        └── PricingView.tsx          # 定价页面组件（已集成支付）
```

## 测试

### 测试模式

1. 使用测试API密钥（`ck_test_` 开头）
2. 在Creem控制台使用测试模式
3. 使用测试卡号进行支付测试

### 测试步骤

1. 配置测试环境变量
2. 启动开发服务器：`npm run dev`
3. 访问定价页面
4. 点击升级按钮
5. 使用测试卡号完成支付
6. 检查Webhook是否正常接收
7. 验证数据库中的订阅记录

## 生产环境部署

### 1. 更新环境变量

- 将 `CREEM_API_KEY` 更换为生产环境密钥（`ck_live_` 开头）
- 更新 `NEXT_PUBLIC_APP_URL` 为生产环境URL
- 确保Webhook URL指向生产环境

### 2. 验证Webhook

- 在Creem控制台测试Webhook连接
- 确保Webhook可以正常接收事件

### 3. 监控

- 监控支付成功率
- 检查Webhook日志
- 监控订阅状态更新

## 常见问题

### Q: Webhook未收到事件？

A: 检查以下几点：
- Webhook URL是否正确配置
- Webhook密钥是否正确
- 服务器是否可访问（检查防火墙和网络）
- 查看Creem控制台的Webhook日志

### Q: 支付成功后订阅状态未更新？

A: 检查：
- Webhook是否正常接收事件
- 数据库迁移是否已执行
- RLS策略是否正确配置
- 查看服务器日志中的错误信息

### Q: 如何查看用户订阅状态？

A: 可以查询 `user_subscriptions` 表：

```sql
SELECT * FROM user_subscriptions WHERE user_id = 'USER_ID';
```

## 安全注意事项

1. **永远不要**在前端代码中暴露API密钥
2. 使用环境变量存储敏感信息
3. 验证Webhook签名确保请求来自Creem
4. 使用RLS策略保护数据库数据
5. 定期检查Webhook日志，发现异常请求

## 参考文档

- [Creem官方文档](https://docs.creem.io/introduction)
- [Creem API参考](https://docs.creem.io/api-reference/introduction)
- [Supabase文档](https://supabase.com/docs)

## 支持

如有问题，请查看：
- Creem支持：https://creem.io/support
- 项目Issues：在GitHub仓库中提交问题

