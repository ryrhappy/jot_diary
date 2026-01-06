import { NextResponse } from 'next/server';

const CATEGORY_KEYWORDS = {
  TODO: ['todo', 'buy', 'task', 'complete', 'need to'],
  DREAM: ['dream', 'future', 'wish', 'vision', 'expect'],
  BEAUTIFUL: ['beautiful', 'happy', 'joy', 'sunshine', 'enjoy'],
  REFLECTION: ['reflect', 'mistake', 'lesson', 'improve', 'regret'],
  GRATITUDE: ['grateful', 'thanks', 'thank', 'blessed']
};

/**
 * Intelligent categorization using DeepSeek API
 */
export async function POST(req: Request) {
  let content: string = '';
  
  try {
    const body = await req.json();
    content = body.content || '';
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ category: 'NORMAL' });
    }

    // Fallback to keyword matching if DeepSeek API Key is not configured
    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ 
        category: categorizeByKeywords(content)
      });
    }

    // Call DeepSeek API for categorization
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
            content: `You are a professional diary categorization assistant. Please categorize the user's diary entry into one of the following categories:

Category descriptions:
- TODO: Tasks, things to do, items to complete
- DREAM: Dreams, visions, future plans, expectations
- BEAUTIFUL: Beautiful moments, happy times, joyful experiences, enjoyable moments
- REFLECTION: Reflections, mistakes, lessons learned, areas for improvement
- GRATITUDE: Gratitude, thanks, things to be thankful for
- NORMAL: Daily records, general diary entries, content that doesn't fit into the above categories

Please return ONLY the category name (in uppercase). For example: TODO, DREAM, BEAUTIFUL, REFLECTION, GRATITUDE, or NORMAL.`
          },
          {
            role: 'user',
            content: `Please categorize the following diary entry:\n\n${content}`
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

    // Validate if the category is valid
    const validCategories = ['TODO', 'DREAM', 'BEAUTIFUL', 'REFLECTION', 'GRATITUDE', 'NORMAL'];
    const finalCategory = validCategories.includes(category) ? category : categorizeByKeywords(content);

    return NextResponse.json({ category: finalCategory });
  } catch (error) {
    console.error('Categorization error:', error);
    // Fallback to keyword matching
    return NextResponse.json({ 
      category: content ? categorizeByKeywords(content) : 'NORMAL'
    });
  }
}

/**
 * Fallback: Categorize using keyword matching
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

