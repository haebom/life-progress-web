import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Client } from '@notionhq/client';
import { 
  PageObjectResponse,
  DatabaseObjectResponse
} from '@notionhq/client/build/src/api-endpoints';
import type { QuestItem } from '@/types/notion';

// Notion 클라이언트 생성 함수
function createNotionClient() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('notion_access_token')?.value;

  if (!accessToken) {
    throw new Error('Notion 연동이 필요합니다.');
  }

  return new Client({ auth: accessToken });
}

// 타입 가드 함수
function isDatabaseResponse(obj: unknown): obj is DatabaseObjectResponse {
  return Boolean(
    obj && 
    typeof obj === 'object' && 
    'id' in obj &&
    'object' in obj &&
    (obj as { object: string }).object === 'database'
  );
}

function isPageResponse(obj: unknown): obj is PageObjectResponse {
  return Boolean(
    obj && 
    typeof obj === 'object' && 
    'properties' in obj
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  if (!action) {
    return NextResponse.json({ error: '액션이 지정되지 않았습니다.' }, { status: 400 });
  }

  try {
    const notion = createNotionClient();

    switch (action) {
      case 'getQuests': {
        if (!userId) {
          return NextResponse.json({ error: '사용자 ID가 필요합니다.' }, { status: 400 });
        }

        // 데이터베이스 검색
        const databases = await notion.search({
          filter: { property: 'object', value: 'database' }
        });

        const database = databases.results[0];
        if (!database || !isDatabaseResponse(database)) {
          return NextResponse.json(
            { error: '사용 가능한 Notion 데이터베이스를 찾을 수 없습니다.' },
            { status: 404 }
          );
        }

        // 퀘스트 조회
        const response = await notion.databases.query({
          database_id: database.id,
          filter: {
            and: [
              {
                property: 'UserID',
                rich_text: { equals: userId },
              },
            ],
          },
          sorts: [{ property: 'Started At', direction: 'descending' }],
        });

        const quests: QuestItem[] = response.results
          .filter(isPageResponse)
          .map(page => {
            const props = page.properties;
            const title = 'Title' in props && 
              props.Title.type === 'title' &&
              props.Title.title[0]?.plain_text || '';

            const status = 'Status' in props && 
              props.Status.type === 'select' && 
              props.Status.select?.name as QuestItem['status'] || 'Not Started';

            const startedAt = 'Started At' in props && 
              props['Started At'].type === 'date' &&
              props['Started At'].date?.start || undefined;

            const completedAt = 'Completed At' in props && 
              props['Completed At'].type === 'date' &&
              props['Completed At'].date?.start || undefined;

            const propUserId = 'UserID' in props && 
              props.UserID.type === 'rich_text' &&
              props.UserID.rich_text[0]?.plain_text || '';

            return {
              id: page.id,
              title,
              status,
              startedAt,
              completedAt,
              userId: propUserId,
            };
          });

        return NextResponse.json(quests);
      }

      default:
        return NextResponse.json(
          { error: '지원하지 않는 액션입니다.' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notion API 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 