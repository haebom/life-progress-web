import { Client } from '@notionhq/client';
import { isFullPage } from '@notionhq/client';
import type { QuestItem } from '@/types/notion';
import type { 
  GetPagePropertyResponse,
  TitlePropertyItemObjectResponse,
  RichTextPropertyItemObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

// 환경 변수 검증
if (!process.env.NOTION_API_KEY) {
  throw new Error('NOTION_API_KEY가 설정되지 않았습니다.');
}

if (!process.env.NOTION_DATABASE_ID) {
  throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.');
}

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: '2022-06-28'
});

// 데이터베이스 속성 접근 함수
async function getPropertyValue(propertyId: string, propertyType: string): Promise<string | number | null> {
  try {
    const property = await notion.pages.properties.retrieve({
      page_id: propertyId,
      property_id: propertyType
    }) as GetPagePropertyResponse;

    if ('object' in property) {
      switch (property.type) {
        case 'title': {
          const titleProperty = property as TitlePropertyItemObjectResponse;
          const titleArray = Array.isArray(titleProperty.title) ? titleProperty.title : [];
          return titleArray[0]?.plain_text ?? null;
        }
        case 'select':
          return property.select?.name ?? null;
        case 'date':
          return property.date?.start ?? null;
        case 'rich_text': {
          const textProperty = property as RichTextPropertyItemObjectResponse;
          const textArray = Array.isArray(textProperty.rich_text) ? textProperty.rich_text : [];
          return textArray[0]?.plain_text ?? null;
        }
        case 'number':
          return property.number ?? null;
        default:
          return null;
      }
    }
    return null;
  } catch (error) {
    console.error(`속성 조회 오류 (${propertyType}):`, error);
    return null;
  }
}

// Notion 상태값을 앱 상태값으로 매핑하는 함수
function mapNotionStatus(status: string | null): 'active' | 'completed' | 'failed' {
  if (!status) return 'active';
  
  switch (status.toLowerCase()) {
    case 'not started':
    case 'in progress':
      return 'active';
    case 'done':
    case 'completed':
      return 'completed';
    default:
      return 'failed';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: '사용자 ID가 필요합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getQuests') {
      const databaseId = process.env.NOTION_DATABASE_ID;
      
      if (!databaseId) {
        return new Response(JSON.stringify({ error: 'Notion 데이터베이스 ID가 설정되지 않았습니다.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          and: [
            {
              property: 'userId',
              rich_text: {
                equals: userId
              }
            },
            {
              property: 'status',
              select: {
                does_not_equal: 'archived'
              }
            }
          ]
        },
        sorts: [
          {
            property: 'createdAt',
            direction: 'descending'
          }
        ]
      });

      const quests = await Promise.all(
        response.results
          .filter(isFullPage)
          .map(async page => {
            try {
              const [title, status, startedAt, completedAt, progress] = await Promise.all([
                getPropertyValue(page.id, 'title'),
                getPropertyValue(page.id, 'status'),
                getPropertyValue(page.id, 'startedAt'),
                getPropertyValue(page.id, 'completedAt'),
                getPropertyValue(page.id, 'progress')
              ]);

              const quest: QuestItem = {
                id: page.id,
                title: String(title || '제목 없음'),
                status: mapNotionStatus(status?.toString() || null),
                startedAt: startedAt?.toString(),
                completedAt: completedAt?.toString(),
                userId,
                progress: typeof progress === 'number' ? progress : 0
              };

              return quest;
            } catch (error) {
              console.error('퀘스트 데이터 변환 오류:', error);
              return null;
            }
          })
      );

      const validQuests = quests.filter((quest): quest is QuestItem => quest !== null);

      return new Response(JSON.stringify(validQuests), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: '잘못된 action입니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Notion API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : 'Notion API 오류가 발생했습니다.';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 