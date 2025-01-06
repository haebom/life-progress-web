import { Client } from '@notionhq/client';
import { isFullPage } from '@notionhq/client';
import type { 
  GetPagePropertyResponse,
  TitlePropertyItemObjectResponse,
  RichTextPropertyItemObjectResponse,
  SelectPropertyItemObjectResponse,
  DatePropertyItemObjectResponse,
  NumberPropertyItemObjectResponse
} from '@notionhq/client/build/src/api-endpoints';
import type { QuestItem, NotionPropertyType } from '@/types/notion';

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

export class NotionService {
  private static instance: NotionService;
  private client: Client;

  private constructor() {
    this.client = notion;
  }

  public static getInstance(): NotionService {
    if (!NotionService.instance) {
      NotionService.instance = new NotionService();
    }
    return NotionService.instance;
  }

  private async getPropertyValue(propertyId: string, propertyType: NotionPropertyType): Promise<string | number | null> {
    try {
      const property = await this.client.pages.properties.retrieve({
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
          case 'select': {
            const selectProperty = property as SelectPropertyItemObjectResponse;
            return selectProperty.select?.name ?? null;
          }
          case 'date': {
            const dateProperty = property as DatePropertyItemObjectResponse;
            return dateProperty.date?.start ?? null;
          }
          case 'rich_text': {
            const textProperty = property as RichTextPropertyItemObjectResponse;
            const textArray = Array.isArray(textProperty.rich_text) ? textProperty.rich_text : [];
            return textArray[0]?.plain_text ?? null;
          }
          case 'number': {
            const numberProperty = property as NumberPropertyItemObjectResponse;
            return numberProperty.number ?? null;
          }
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

  private mapNotionStatus(status: string | null): 'active' | 'completed' | 'failed' {
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

  public async getQuests(userId: string): Promise<QuestItem[]> {
    const databaseId = process.env.NOTION_DATABASE_ID;
    
    if (!databaseId) {
      throw new Error('Notion 데이터베이스 ID가 설정되지 않았습니다.');
    }

    const response = await this.client.databases.query({
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
              this.getPropertyValue(page.id, 'title' as NotionPropertyType),
              this.getPropertyValue(page.id, 'select' as NotionPropertyType),
              this.getPropertyValue(page.id, 'date' as NotionPropertyType),
              this.getPropertyValue(page.id, 'date' as NotionPropertyType),
              this.getPropertyValue(page.id, 'number' as NotionPropertyType)
            ]);

            const quest: QuestItem = {
              id: page.id,
              title: String(title || '제목 없음'),
              status: this.mapNotionStatus(status?.toString() || null),
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

    return quests.filter((quest): quest is QuestItem => quest !== null);
  }
}

export const Notion = NotionService.getInstance(); 