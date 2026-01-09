import { NextRequest, NextResponse } from 'next/server';
import { verifyCreemWebhook } from '@/lib/creem';
import { supabase } from '@/lib/supabase';

/**
 * Creem Webhook处理
 * POST /api/creem/webhook
 * 
 * 处理Creem支付事件，更新用户订阅状态
 */
export async function POST(req: NextRequest) {
  try {
    // 获取Webhook签名
    const signature = req.headers.get('x-creem-signature') || '';
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // 读取请求体
    const body = await req.text();
    
    // 验证Webhook签名
    const isValid = verifyCreemWebhook(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 解析事件数据
    const event = JSON.parse(body);

    console.log('Creem webhook event:', event.type, event.data);

    // 处理不同类型的事件
    switch (event.type) {
      case 'payment.succeeded':
      case 'checkout.session.completed':
        await handlePaymentSuccess(event);
        break;
      
      case 'payment.failed':
      case 'checkout.session.failed':
        await handlePaymentFailed(event);
        break;
      
      case 'subscription.created':
      case 'subscription.updated':
        await handleSubscriptionUpdate(event);
        break;
      
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event);
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Creem webhook error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 处理支付成功事件
 */
async function handlePaymentSuccess(event: any) {
  const { customer_id, product_id, metadata } = event.data;
  
  if (!customer_id) {
    console.error('No customer_id in payment success event');
    return;
  }

  // 更新用户订阅状态
  // 这里需要根据你的数据库结构来实现
  // 假设有一个user_subscriptions表
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: customer_id,
        product_id: product_id,
        status: 'active',
        plan_id: metadata?.plan_id || 'pro',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log('Subscription updated successfully for user:', customer_id);
    }
  } catch (err) {
    console.error('Error in handlePaymentSuccess:', err);
  }
}

/**
 * 处理支付失败事件
 */
async function handlePaymentFailed(event: any) {
  const { customer_id } = event.data;
  console.log('Payment failed for customer:', customer_id);
  // 可以在这里发送通知或更新状态
}

/**
 * 处理订阅更新事件
 */
async function handleSubscriptionUpdate(event: any) {
  const { customer_id, product_id, status, metadata } = event.data;
  
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: customer_id,
        product_id: product_id,
        status: status || 'active',
        plan_id: metadata?.plan_id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error updating subscription:', error);
    }
  } catch (err) {
    console.error('Error in handleSubscriptionUpdate:', err);
  }
}

/**
 * 处理订阅取消事件
 */
async function handleSubscriptionCanceled(event: any) {
  const { customer_id } = event.data;
  
  try {
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', customer_id);

    if (error) {
      console.error('Error canceling subscription:', error);
    }
  } catch (err) {
    console.error('Error in handleSubscriptionCanceled:', err);
  }
}

