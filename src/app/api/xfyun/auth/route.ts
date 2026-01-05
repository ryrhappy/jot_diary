import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const appId = process.env.XFYUN_APP_ID || '';
  const apiKey = process.env.XFYUN_API_KEY || '';
  const apiSecret = process.env.XFYUN_API_SECRET || '';

  if (!appId || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Xfyun configuration missing' }, { status: 500 });
  }

  // 生成 UTC 时间，格式：2025-01-05T09:32:17+0800
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const utc = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+0800`;
  
  const uuid = crypto.randomUUID().replace(/-/g, '');
  
  // 尝试方法1：标准 HMAC-SHA256 签名（对所有参数）
  const paramString = [
    `accessKeyId=${apiKey}`,
    `appId=${appId}`,
    `audio_encode=pcm_s16le`,
    `lang=autodialect`,
    `samplerate=16000`,
    `utc=${utc}`,
    `uuid=${uuid}`
  ].join('&');
  
  const signature1 = crypto.createHmac('sha256', apiSecret)
    .update(paramString, 'utf8')
    .digest('base64');
  
  // 尝试方法2：MD5 + HMAC-SHA1（备选方案）
  const baseString = appId + utc;
  const md5Hash = crypto.createHash('md5').update(baseString, 'utf8').digest('hex');
  const signature2 = crypto.createHmac('sha1', apiSecret)
    .update(md5Hash, 'utf8')
    .digest('base64');

  // 使用方法2：MD5 + HMAC-SHA1（根据科大讯飞文档示例）
  const signature = signature2;

  // 构造请求参数
  const params = new URLSearchParams({
    appId,
    accessKeyId: apiKey,
    utc,
    uuid,
    signature,
    audio_encode: 'pcm_s16le',
    lang: 'autodialect',
    samplerate: '16000'
  });

  const url = `wss://office-api-ast-dx.iflyaisol.com/ast/communicate/v1?${params.toString()}`;

  // 返回 URL 和调试信息
  const { searchParams } = new URL(request.url);
  const debug = searchParams.get('debug') === 'true';
  
  return NextResponse.json({ 
    url,
    ...(debug && {
      debug: {
        utc,
        uuid,
        signature_method1: signature1,
        signature_method2: signature2,
        signature_used: signature,
        paramString
      }
    })
  });
}

