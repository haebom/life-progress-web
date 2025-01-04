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

// Rate Limiting 설정
const RATE_LIMIT = {
  maxRequests: 3, // 동시 요청 제한
  windowMs: 1000, // 1초
  retryAfter: 2000, // 2초 후 재시도
};

class RateLimiter {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private requestCount = 0;
  private lastReset = Date.now();

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      if (now - this.lastReset >= RATE_LIMIT.windowMs) {
        this.requestCount = 0;
        this.lastReset = now;
      }

      if (this.requestCount >= RATE_LIMIT.maxRequests) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT.retryAfter));
        continue;
      }

      const fn = this.queue.shift();
      if (fn) {
        this.requestCount++;
        try {
          await fn();
        } catch (error) {
          console.error('Rate limiter error:', error);
        }
      }
    }

    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// Notion 클라이언트 생성 함수
function createNotionClient() {
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
async function getFirstDatabase(notion: Client): Promise<string> {
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

function isFullPage(
  response: PageObjectResponse | PartialPageObjectResponse | DatabaseObjectResponse | PartialDatabaseObjectResponse
): response is PageObjectResponse {
  return 'properties' in response;
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

// 사용자의 퀘스트 목록 조회
export async function getUserQuests(userId: string): Promise<QuestItem[]> {
  const notion = createNotionClient();
  const databaseId = await getFirstDatabase(notion);

  return rateLimiter.add(async () => {
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
  });
}

// 새 퀘스트 생성
export async function createQuest(quest: Omit<QuestItem, 'id'>): Promise<QuestItem | null> {
  const notion = createNotionClient();
  const databaseId = await getFirstDatabase(notion);

  return rateLimiter.add(async () => {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          Title: {
            title: [{ text: { content: quest.title } }],
          },
          Status: {
            select: { name: quest.status },
          },
          'Started At': {
            date: quest.startedAt ? { start: quest.startedAt } : null,
          },
          'Completed At': {
            date: quest.completedAt ? { start: quest.completedAt } : null,
          },
          UserID: {
            rich_text: [{ text: { content: quest.userId } }],
          },
        },
      });

      return {
        id: response.id,
        ...quest,
      };
    } catch (error) {
      handleNotionError(error);
    }
  });
}

// 퀘스트 상태 업데이트
export async function updateQuestStatus(
  questId: string,
  status: QuestItem['status'],
  completedAt?: string
): Promise<boolean> {
  const notion = createNotionClient();

  return rateLimiter.add(async () => {
    try {
      await notion.pages.update({
        page_id: questId,
        properties: {
          Status: {
            select: { name: status },
          },
          ...(completedAt && {
            'Completed At': {
              date: { start: completedAt },
            },
          }),
        },
      });
      return true;
    } catch (error) {
      handleNotionError(error);
    }
  });
}

// 퀘스트 삭제
export async function deleteQuest(questId: string): Promise<boolean> {
  const notion = createNotionClient();

  return rateLimiter.add(async () => {
    try {
      await notion.pages.update({
        page_id: questId,
        archived: true,
      });
      return true;
    } catch (error) {
      handleNotionError(error);
    }
  });
} 