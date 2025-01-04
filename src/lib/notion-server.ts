import { Client, APIErrorCode, APIResponseError } from '@notionhq/client';
import { cookies } from 'next/headers';
import { 
  PageObjectResponse, 
  PartialPageObjectResponse, 
  DatabaseObjectResponse,
  PartialDatabaseObjectResponse
} from '@notionhq/client/build/src/api-endpoints';

// Notion 타입 정의
export interface QuestItem {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  startedAt?: string;
  completedAt?: string;
  userId: string;
}

function handleNotionError(error: unknown): never {
  if (error instanceof APIResponseError) {
    switch (error.code) {
      case APIErrorCode.Unauthorized:
        throw new Error('Notion API 토큰이 유효하지 않습니다. 관리자에게 문의하세요.');
      case APIErrorCode.RestrictedResource:
        throw new Error('해당 Notion 데이터베이스에 접근 권한이 없습니다.');
      case APIErrorCode.RateLimited:
        throw new Error('Notion API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
      case APIErrorCode.ObjectNotFound:
        throw new Error('요청한 Notion 리소스를 찾을 수 없습니다.');
      case APIErrorCode.ValidationError:
        throw new Error('잘못된 요청입니다. 입력값을 확인해주세요.');
      case APIErrorCode.ConflictError:
        throw new Error('동시에 여러 수정 요청이 발생했습니다. 다시 시도해주세요.');
      default:
        throw new Error(`Notion API 오류: ${error.message}`);
    }
  }
  throw error instanceof Error 
    ? error 
    : new Error('알 수 없는 오류가 발생했습니다.');
}

function isFullPage(
  response: PageObjectResponse | PartialPageObjectResponse | DatabaseObjectResponse | PartialDatabaseObjectResponse
): response is PageObjectResponse {
  return 'properties' in response;
}

// Notion 클라이언트 생성 함수
export function createNotionClient() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('notion_access_token')?.value;

  if (!accessToken) {
    throw new Error('Notion 연동이 필요합니다. 노션 연동을 먼저 진행해주세요.');
  }

  return new Client({
    auth: accessToken,
  });
}

// 데이터베이스 ID 가져오기 (워크스페이스의 첫 번째 데이터베이스 사용)
export async function getFirstDatabase(notion: Client): Promise<string> {
  try {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database',
      },
    });

    const database = response.results[0];
    if (!database || !('id' in database)) {
      throw new Error('사용 가능한 Notion 데이터베이스를 찾을 수 없습니다.');
    }

    return database.id;
  } catch (error) {
    handleNotionError(error);
  }
}

// 서버 사이드 Notion API 호출 함수들
export async function getQuestsFromNotion(userId: string): Promise<QuestItem[]> {
  const notion = createNotionClient();
  const databaseId = await getFirstDatabase(notion);

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'UserID',
            rich_text: {
              equals: userId,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Started At',
          direction: 'descending',
        },
      ],
    });

    return response.results
      .filter(isFullPage)
      .map(page => {
        const properties = page.properties;
        return {
          id: page.id,
          title: 'Title' in properties && properties.Title.type === 'title' 
            ? properties.Title.title[0]?.plain_text || ''
            : '',
          status: 'Status' in properties && properties.Status.type === 'select' && properties.Status.select
            ? (properties.Status.select.name as QuestItem['status'])
            : 'Not Started',
          startedAt: 'Started At' in properties && properties['Started At'].type === 'date' 
            ? properties['Started At'].date?.start
            : undefined,
          completedAt: 'Completed At' in properties && properties['Completed At'].type === 'date'
            ? properties['Completed At'].date?.start
            : undefined,
          userId: 'UserID' in properties && properties.UserID.type === 'rich_text'
            ? properties.UserID.rich_text[0]?.plain_text || ''
            : '',
        };
      });
  } catch (error) {
    handleNotionError(error);
  }
} 