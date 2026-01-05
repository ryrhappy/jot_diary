import { NextResponse } from 'next/server';

const CATEGORY_KEYWORDS = {
  TODO: ['待办', '要去', '完成', '任务', '买', 'todo', 'buy'],
  DREAM: ['梦想', '以后', '想成为', '愿景', '期待', 'dream', 'future'],
  BEAUTIFUL: ['美好', '开心', '快乐', '阳光', '享受', 'beautiful', 'happy'],
  REFLECTION: ['反思', '错误', '教训', '改进', '后悔', 'reflect', 'mistake'],
  GRATITUDE: ['感恩', '感谢', '幸好', '谢谢', 'grateful', 'thanks']
};

/**
 * 使用 DeepSeek API 进行智能分类
 */
export async function POST(req: Request) {
  let content: string = '';
  
  try {
    const body = await req.json();
    content = body.content || '';
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ category: 'NORMAL' });
    }

    // 如果没有配置 DeepSeek API Key，使用关键词匹配作为降级方案
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        category: categorizeByKeywords(content)
      });
    }

    // 调用 DeepSeek API 进行分类
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的日记分类助手。请根据用户提供的日记内容，将其分类到以下类别之一：

分类说明：
- TODO: 待办事项、任务、需要完成的事情
- DREAM: 梦想、愿景、未来计划、期待
- BEAUTIFUL: 美好事情、开心时刻、快乐体验、享受的时光
- REFLECTION: 反思、错误、教训、需要改进的地方
- GRATITUDE: 感恩、感谢、值得庆幸的事情
- NORMAL: 日常记录、普通日记、无法归入以上类别的内容

请只返回分类名称（大写），不要返回其他内容。例如：TODO、DREAM、BEAUTIFUL、REFLECTION、GRATITUDE 或 NORMAL。`
          },
          {
            role: 'user',
            content: `请对以下日记内容进行分类：\n\n${content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const category = data.choices[0]?.message?.content?.trim().toUpperCase() || 'NORMAL';

    // 验证分类是否有效
    const validCategories = ['TODO', 'DREAM', 'BEAUTIFUL', 'REFLECTION', 'GRATITUDE', 'NORMAL'];
    const finalCategory = validCategories.includes(category) ? category : categorizeByKeywords(content);

    return NextResponse.json({ category: finalCategory });
  } catch (error) {
    console.error('Categorization error:', error);
    // 降级到关键词匹配
    return NextResponse.json({ 
      category: content ? categorizeByKeywords(content) : 'NORMAL'
    });
  }
}

/**
 * 降级方案：使用关键词匹配进行分类
 */
function categorizeByKeywords(content: string): string {
  const lowerContent = content.toLowerCase();
  for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => lowerContent.includes(k))) {
      return key;
    }
  }
  return 'NORMAL';
}

