import { NextRequest, NextResponse } from 'next/server';
import { createCreemCheckoutSession } from '@/lib/creem';
import { createClient } from '@supabase/supabase-js';

/**
 * 创建Creem支付会话
 * POST /api/creem/checkout
 */
export async function POST(req: NextRequest) {
  try {
    // 验证用户认证
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从Supabase获取用户信息
    const token = authHeader.replace('Bearer ', '');
    
    // 创建服务端Supabase客户端用于验证token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // 验证token并获取用户信息
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await req.json();
    const { productId, planId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    console.log('Creating Creem checkout session:', {
      productId,
      userId: user.id,
      userEmail: user.email,
      planId,
    });

    // 创建支付会话
    const session = await createCreemCheckoutSession(
      productId,
      user.id, // 使用Supabase用户ID作为customer_id
      {
        user_id: user.id,
        user_email: user.email,
        plan_id: planId,
      }
    );

    console.log('Creem checkout session created:', {
      sessionId: session.id,
      checkoutUrl: session.url,
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Creem checkout error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

