import { Client, isNotionClientError } from '@notionhq/client';
import type { PageObjectResponse, PartialPageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export interface NotionError extends Error {
  code: string;
  status: number;
}

export interface Quest {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  startedAt?: string;
  completedAt?: string;
  userId: string;
}

export interface NotionProperty {
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  number?: number;
  select?: { name: string };
  multi_select?: Array<{ name: string }>;
  date?: { start: string | null };
  checkbox?: boolean;
}

export async function getQuestsFromNotion(userId: string): Promise<Quest[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID || '',
      filter: {
        and: [
          {
            property: 'UserID',
            rich_text: { equals: userId }
          },
          {
            property: 'Status',
            select: { equals: 'Active' }
          }
        ]
      },
      sorts: [
        {
          property: 'Created At',
          direction: 'descending'
        }
      ]
    });

    return response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map(page => {
        const properties = page.properties as Record<string, NotionProperty>;
        return {
          id: page.id,
          title: properties.Title?.title?.[0]?.plain_text || '',
          status: properties.Status?.select?.name as Quest['status'] || 'Not Started',
          startedAt: properties['Started At']?.date?.start || undefined,
          completedAt: properties['Completed At']?.date?.start || undefined,
          userId: properties.UserID?.rich_text?.[0]?.plain_text || '',
        };
      });
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API Error:', error);
      throw error;
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to fetch quests');
  }
}

export async function getDatabase(databaseId: string) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    return response;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API Error:', error);
      throw error;
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to fetch database');
  }
}

export async function createPage(databaseId: string, properties: Record<string, any>) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    });
    return response;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API Error:', error);
      throw error;
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to create page');
  }
}

export async function updatePage(pageId: string, properties: Record<string, any>) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });
    return response;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API Error:', error);
      throw error;
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to update page');
  }
}

export async function archivePage(pageId: string) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      archived: true,
    });
    return response;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API Error:', error);
      throw error;
    }
    console.error('Unknown error:', error);
    throw new Error('Failed to archive page');
  }
}

export function extractPageProperties(page: PageObjectResponse) {
  const properties = page.properties;
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(properties)) {
    const prop = value as NotionProperty;
    if (prop.type === 'title') {
      result[key] = prop.title?.[0]?.plain_text || '';
    } else if (prop.type === 'rich_text') {
      result[key] = prop.rich_text?.[0]?.plain_text || '';
    } else if (prop.type === 'number') {
      result[key] = prop.number;
    } else if (prop.type === 'select') {
      result[key] = prop.select?.name || '';
    } else if (prop.type === 'multi_select') {
      result[key] = prop.multi_select?.map(item => item.name) || [];
    } else if (prop.type === 'date') {
      result[key] = prop.date?.start || null;
    } else if (prop.type === 'checkbox') {
      result[key] = prop.checkbox;
    }
  }

  return result;
} 