/**
 * Creem支付工具函数和类型定义
 */

export interface CreemProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: 'one_time' | 'subscription';
}

export interface CreemCheckoutSession {
  id: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CreemWebhookEvent {
  type: string;
  data: {
    id: string;
    status: string;
    customer_id?: string;
    product_id?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Creem API配置
 */
const CREEM_API_BASE = process.env.NEXT_PUBLIC_CREEM_API_BASE || 'https://api.creem.io';
const CREEM_TEST_API_BASE = 'https://test-api.creem.io';

/**
 * 获取Creem API基础URL
 */
export function getCreemApiBase(): string {
  const apiKey = process.env.CREEM_API_KEY || '';
  // 测试密钥以 ck_test_ 或 creem_test_ 开头
  if (apiKey.startsWith('ck_test_') || apiKey.startsWith('creem_test_')) {
    return CREEM_TEST_API_BASE;
  }
  return CREEM_API_BASE;
}

/**
 * 创建Creem支付会话
 */
export async function createCreemCheckoutSession(
  productId: string,
  customerEmail?: string,
  customerId?: string,
  metadata?: Record<string, any>
): Promise<CreemCheckoutSession> {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const apiBase = getCreemApiBase();
  const url = `${apiBase}/v1/checkouts`;

  // 构建请求体，排除 undefined 值
  const requestBody: Record<string, any> = {
    product_id: productId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/pricing?success=true`,
    metadata: metadata || {},
  };

  // 构建 customer 对象
  const customer: Record<string, string> = {};
  if (customerEmail) {
    customer.email = customerEmail;
  }
  if (customerId) {
    customer.id = customerId;
  }

  // 只有当 customer 对象不为空时才添加
  if (Object.keys(customer).length > 0) {
    requestBody.customer = customer;
  }

  console.log('Creem API Request:', {
    url,
    method: 'POST',
    apiKeyPrefix: apiKey.substring(0, 15) + '...',
    body: requestBody,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Creem API Response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 500),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Keep the original error message
      }
      throw new Error(`Creem API error: ${errorMessage}`);
    }

    const data = JSON.parse(responseText);
    console.log('Creem API Success:', data);

    return {
      id: data.id,
      url: data.checkout_url,
      status: data.status || 'pending',
    };
  } catch (error) {
    console.error('Creem API request failed:', error);
    throw error;
  }
}

/**
 * 验证Creem Webhook签名
 */
export function verifyCreemWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // 这里应该实现Creem的签名验证逻辑
  // 根据Creem文档实现HMAC验证
  // 暂时返回true，实际使用时需要根据Creem文档实现
  return true;
}

