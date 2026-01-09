# Creem支付配置检查清单

## ✅ 已完成的配置

根据你提供的信息，以下配置已完成：

### 1. Creem产品创建
- ✅ Pro套餐产品已创建
- ✅ 产品ID: `prod_52anWjkUKalpL5cUwuMRB6`

### 2. API密钥
- ✅ API密钥: `creem_test_54hAI0vWRSuT5VHBIwpCUi`
- ✅ Webhook密钥: `whsec_grT0odghhGcOCINBZIFBM`

### 3. 数据库
- ✅ 已在Supabase执行订阅表迁移SQL

## 📝 需要配置的环境变量

请在项目根目录创建 `.env.local` 文件，并添加以下内容：

```bash
# Creem支付配置
CREEM_API_KEY=creem_test_54hAI0vWRSuT5VHBIwpCUi
CREEM_WEBHOOK_SECRET=whsec_grT0odghhGcOCINBZIFBM

# Creem产品ID
NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO=prod_52anWjkUKalpL5cUwuMRB6
# Premium套餐暂未创建，可以留空
NEXT_PUBLIC_CREEM_PRODUCT_ID_PREMIUM=

# 应用URL（注意：应该是根域名，不包含路径）
NEXT_PUBLIC_APP_URL=https://www.jotdiary.xyz
```

**重要提示**：
- `NEXT_PUBLIC_APP_URL` 应该是 `https://www.jotdiary.xyz`，**不包含** `/en` 路径
- 支付成功/取消后的回调URL会自动添加路径：`/pricing?success=true` 或 `/pricing?canceled=true`

## 🔧 代码更新说明

### 1. API密钥格式支持
已更新代码以支持 `creem_test_` 格式的API密钥（之前只支持 `ck_test_` 格式）

### 2. Premium套餐处理
- Premium套餐按钮在没有配置产品ID时会显示"即将开放"
- 按钮会被禁用，防止误操作

## 🌐 Webhook配置

### 在Creem控制台配置Webhook

1. 登录Creem控制台
2. 进入"Webhooks"页面
3. 添加Webhook URL：
   ```
   https://www.jotdiary.xyz/api/creem/webhook
   ```
4. 选择要监听的事件：
   - `payment.succeeded`
   - `payment.failed`
   - `checkout.session.completed`
   - `checkout.session.failed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.canceled`
5. 保存配置

## 🧪 测试步骤

### 1. 本地测试（开发环境）

1. 配置 `.env.local` 文件
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 访问定价页面：`http://localhost:3000/pricing`
4. 点击Pro套餐的"立即升级"按钮
5. 使用测试卡号完成支付

**注意**：本地开发时，Webhook需要使用ngrok等工具创建隧道：
```bash
ngrok http 3000
# 将生成的URL配置到Creem Webhook设置中
```

### 2. 生产环境测试

1. 确保Vercel（或其他部署平台）已配置所有环境变量
2. 访问：`https://www.jotdiary.xyz/pricing`
3. 测试支付流程
4. 检查Webhook是否正常接收事件

## ⚠️ 注意事项

1. **API密钥格式**：你的API密钥是 `creem_test_` 开头，代码已更新支持此格式
2. **APP_URL路径**：确保 `NEXT_PUBLIC_APP_URL` 不包含语言路径（如 `/en`），代码会自动处理路径
3. **Premium套餐**：当前未创建Premium产品，Premium套餐按钮会显示"即将开放"
4. **Webhook验证**：当前Webhook签名验证是占位实现，需要根据Creem文档实现实际的HMAC验证

## 🔍 验证配置

### 检查环境变量是否正确加载

在浏览器控制台运行：
```javascript
console.log('Product ID Pro:', process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO);
console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);
```

### 检查API路由

访问：`https://www.jotdiary.xyz/api/creem/checkout`（应该返回401，因为需要认证）

## 📚 相关文档

- [Creem支付集成指南](./Creem支付集成指南.md)
- [Creem支付集成工作总结](./steps/20260109_Creem支付集成.md)

