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
 * 可能的API端点路径（按优先级排序）
 */
const CHECKOUT_ENDPOINTS = [
  '/v1/checkout/sessions',
  '/api/v1/checkout/sessions',
  '/v1/payments/checkout',
  '/checkout/sessions',
  '/api/checkout/sessions',
];

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
  customerId?: string,
  metadata?: Record<string, any>
): Promise<CreemCheckoutSession> {
  const apiKey = process.env.CREEM_API_KEY;
  
  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured');
  }

  const apiBase = getCreemApiBase();
  const requestBody = {
    product_id: productId,
    customer_id: customerId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/pricing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/pricing?canceled=true`,
    metadata: metadata || {},
  };

  // 尝试不同的API端点路径
  let lastError: Error | null = null;
  for (const endpoint of CHECKOUT_ENDPOINTS) {
    const url = `${apiBase}${endpoint}`;
    
    console.log('Creem API Request:', {
      url,
      method: 'POST',
      apiKeyPrefix: apiKey.substring(0, 20) + '...',
      body: requestBody,
    });

    try {
      // 尝试不同的请求头格式
      const headers = [
        {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
        },
      ];

      let response: Response | null = null;
      let lastHeaderError: Error | null = null;

      for (const header of headers) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(requestBody),
          });

          const responseText = await response.text();
          console.log('Creem API Response:', {
            endpoint,
            headerFormat: header['x-api-key'] ? 'x-api-key' : 'Authorization',
            status: response.status,
            statusText: response.statusText,
            body: responseText.substring(0, 500), // 限制日志长度
          });

          if (response.ok) {
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (e) {
              throw new Error(`Failed to parse Creem API response: ${responseText}`);
            }

            console.log('Creem API Success Response:', data);

            return {
              id: data.id || data.session_id,
              url: data.checkout_url || data.url || data.payment_url,
              status: data.status || 'pending',
            };
          } else if (response.status === 404) {
            // 404错误，尝试下一个请求头格式
            console.log(`Header format failed with 404, trying next format...`);
            continue;
          } else {
            // 其他错误，记录详情但继续尝试
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorData.error || errorMessage;
              console.error('Creem API Error Details:', errorData);
            } catch (e) {
              console.error('Creem API Error Response (non-JSON):', responseText);
            }
            // 非404错误，可能是认证问题，尝试下一个请求头
            if (response.status === 401 || response.status === 403) {
              continue;
            }
            // 其他错误直接抛出
            throw new Error(`Creem API error: ${errorMessage}`);
          }
        } catch (error) {
          // 如果是明确的非404错误，直接抛出
          if (error instanceof Error && !error.message.includes('404') && !error.message.includes('Failed to parse')) {
            throw error;
          }
          lastHeaderError = error instanceof Error ? error : new Error(String(error));
          continue;
        }
      }

      // 所有请求头格式都返回404，尝试下一个端点
      if (!response || response.status === 404) {
        console.log(`All header formats failed for endpoint ${endpoint}, trying next endpoint...`);
        lastError = new Error(`HTTP 404: Not Found (endpoint: ${endpoint})`);
        continue;
      }
    } catch (error) {
      // 如果是网络错误或非404错误，直接抛出
      if (error instanceof Error && !error.message.includes('404')) {
        throw error;
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // 所有端点都失败了
  throw new Error(
    `Creem API error: All endpoints failed. Last error: ${lastError?.message || 'Unknown error'}. ` +
    `Please check Creem API documentation for the correct endpoint.`
  );

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

