# Creem API 测试指南

## 问题排查

如果创建支付会话失败，请按以下步骤排查：

### 1. 检查环境变量

确保 `.env.local` 文件包含：
```bash
CREEM_API_KEY=creem_test_54hAI0vWRSuT5VHBIwpCUi
CREEM_WEBHOOK_SECRET=whsec_grT0odghhGcOCINBZIFBM
NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO=prod_52anWjkUKalpL5cUwuMRB6
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok.io  # 使用ngrok URL
```

**重要**：使用ngrok测试时，`NEXT_PUBLIC_APP_URL` 应该设置为ngrok提供的URL，例如：
```bash
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

### 2. 查看详细日志

启动开发服务器后，在浏览器控制台和服务器终端查看详细日志：

- **请求日志**：会显示发送给Creem API的完整请求
- **响应日志**：会显示Creem API返回的完整响应

### 3. 常见错误及解决方案

#### 错误：401 Unauthorized
- **原因**：API密钥不正确或格式错误
- **解决**：检查 `CREEM_API_KEY` 是否正确，确保包含完整密钥

#### 错误：404 Not Found
- **原因**：API端点路径不正确
- **解决**：检查Creem文档确认正确的API端点路径

#### 错误：400 Bad Request
- **原因**：请求参数格式不正确
- **解决**：查看响应日志中的错误详情，检查请求体格式

### 4. 使用curl测试API

可以直接使用curl测试Creem API：

```bash
curl -X POST https://test-api.creem.io/v1/checkout/sessions \
  -H "Content-Type: application/json" \
  -H "x-api-key: creem_test_54hAI0vWRSuT5VHBIwpCUi" \
  -d '{
    "product_id": "prod_52anWjkUKalpL5cUwuMRB6",
    "success_url": "https://your-ngrok-url.ngrok.io/en/pricing?success=true",
    "cancel_url": "https://your-ngrok-url.ngrok.io/en/pricing?canceled=true"
  }'
```

### 5. 检查Creem控制台

1. 登录Creem控制台
2. 查看API日志，确认请求是否到达
3. 检查产品ID是否正确
4. 确认测试模式已启用

### 6. 可能的API端点变体

如果 `/v1/checkout/sessions` 不工作，尝试：
- `/api/v1/checkout/sessions`
- `/v1/payments/checkout`
- `/checkout/sessions`

需要根据Creem官方文档确认正确的端点。

