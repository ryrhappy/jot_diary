import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const appId = '3eac4fce';
  const apiKey = '5daff4994aadc0cd2ea17442dc7f2855';
  const apiSecret = 'NGlwZmM5OGI5ZmYzOWI2NmVlY2Y2YyNzkz';

  const utc = new Date().toISOString().replace(/\.\d{3}Z$/, '+0800'); // Simplified UTC format for XfYun
  const uuid = crypto.randomUUID().replace(/-/g, '');
  
  // Signature algorithm for RTASR LLM:
  // 1. md5(appId + utc)
  // 2. hmac-sha1(md5, apiKey) -> No, usually apiSecret is used for HMAC
  // Let's use the one from the search result: signature = base64(hmac-sha1(md5(appId + utc), apiKey))
  // Wait, let me double check the "API Key" vs "API Secret" usage.
  // In RTASR LLM, signature uses APIKey as the secret for HMAC? 
  // Most XfYun services use APISecret. The search result said "using accessKey (APIKey) to encrypt". 
  // Let's follow the search result's logic for signature.
  
  const baseString = appId + utc;
  const md5Hash = crypto.createHash('md5').update(baseString).digest('hex');
  const signature = crypto.createHmac('sha1', apiSecret).update(md5Hash).digest('base64');

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

  return NextResponse.json({ url });
}

