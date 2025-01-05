import { NextResponse } from 'next/server';
import { Notion } from '@/lib/notion';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'getQuests': {
        const quests = await Notion.getQuests(userId);
        return NextResponse.json(quests);
      }
      
      default:
        return NextResponse.json(
          { error: '잘못된 action입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notion API 오류:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Notion API 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { 
      status: 500 
    });
  }
} 