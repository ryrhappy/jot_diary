import { NextRequest, NextResponse } from 'next/server';
import { createCreemCheckoutSession } from '@/lib/creem';
import { createClient } from '@supabase/supabase-js';

/**
 * 创建Creem支付会话
 * POST /api/creem/checkout
 */
export async function POST(req: NextRequest) {
  console.log('[Creem Checkout] API route called');
  try {
    // 验证用户认证
    const authHeader = req.headers.get('authorization');
    console.log('[Creem Checkout] Auth header present:', !!authHeader);

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从Supabase获取用户信息
    const token = authHeader.replace('Bearer ', '');
    console.log('[Creem Checkout] Token length:', token?.length);

    // 创建服务端Supabase客户端用于验证token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    console.log('[Creem Checkout] Supabase URL configured:', !!supabaseUrl);
    console.log('[Creem Checkout] Supabase Anon Key configured:', !!supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[Creem Checkout] Creating Supabase client...');
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

    // 验证token并获取用户信息
    console.log('[Creem Checkout] Verifying user token...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    console.log('[Creem Checkout] Auth result:', { user: !!user, authError: authError?.message });

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // 解析请求体
    console.log('[Creem Checkout] Parsing request body...');
    const body = await req.json();
    const { productId, planId } = body;

    console.log('[Creem Checkout] Request body:', { productId, planId });

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    console.log('[Creem Checkout] Creating Creem checkout session:', {
      productId,
      userId: user.id,
      userEmail: user.email,
      planId,
    });

    // 创建支付会话
    console.log('[Creem Checkout] Calling Creem API...');
    const session = await createCreemCheckoutSession(
      productId,
      user.email || undefined, // 使用用户邮箱
      undefined, // 不传递 customer ID，让 Creem 自动创建
      {
        user_id: user.id,
        user_email: user.email,
        plan_id: planId,
      }
    );

    console.log('[Creem Checkout] Session created successfully:', {
      sessionId: session.id,
      checkoutUrl: session.url,
    });

    return NextResponse.json({
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('[Creem Checkout] Error occurred:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
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

