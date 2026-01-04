import { NextResponse } from 'next/server';

const CATEGORY_KEYWORDS = {
  TODO: ['待办', '要去', '完成', '任务', '买', 'todo', 'buy'],
  DREAM: ['梦想', '以后', '想成为', '愿景', '期待', 'dream', 'future'],
  BEAUTIFUL: ['美好', '开心', '快乐', '阳光', '享受', 'beautiful', 'happy'],
  REFLECTION: ['反思', '错误', '教训', '改进', '后悔', 'reflect', 'mistake'],
  GRATITUDE: ['感恩', '感谢', '幸好', '谢谢', 'grateful', 'thanks']
};

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    
    // Simulate AI delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    let category = 'NORMAL';
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => content.toLowerCase().includes(k))) {
        category = key;
        break;
      }
    }

    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to categorize' }, { status: 500 });
  }
}

