import { supabase } from './supabase';

/**
 * 用户订阅状态
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  product_id: string;
  plan_id: 'pro' | 'premium';
  status: 'active' | 'canceled' | 'expired';
  creem_customer_id?: string;
  creem_subscription_id?: string;
  creem_payment_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * 获取用户当前订阅状态
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return null;
      }
      throw error;
    }

    return data as UserSubscription;
  } catch (err) {
    console.error('Error fetching user subscription:', err);
    return null;
  }
}

/**
 * 检查用户是否有特定套餐
 */
export async function hasPlan(userId: string, planId: 'pro' | 'premium'): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return false;
  }
  
  // 如果用户有premium，也认为有pro权限
  if (planId === 'pro' && subscription.plan_id === 'premium') {
    return true;
  }
  
  return subscription.plan_id === planId;
}

/**
 * 检查用户是否为付费用户
 */
export async function isPaidUser(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription !== null && subscription.status === 'active';
}

