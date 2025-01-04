import { NextResponse } from 'next/server';
import { getQuestsFromNotion } from '@/lib/notion-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: '사용자 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const quests = await getQuestsFromNotion(userId);
    return NextResponse.json(quests);
  } catch (error) {
    console.error('퀘스트 조회 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '퀘스트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 