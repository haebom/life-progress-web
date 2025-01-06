import { describe, it, expect, vi } from 'vitest';
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

vi.mock('@notionhq/client', () => ({
  Client: vi.fn().mockImplementation(() => ({
    databases: {
      query: vi.fn().mockResolvedValue({
        results: [
          {
            id: 'test-page-id',
            properties: {
              Title: {
                type: 'title',
                title: [{ plain_text: 'Test Quest' }]
              },
              Status: {
                type: 'select',
                select: { name: 'In Progress' }
              },
              'Started At': {
                type: 'date',
                date: { start: '2024-01-01' }
              },
              'Completed At': {
                type: 'date',
                date: { start: '2024-01-02' }
              },
              UserID: {
                type: 'rich_text',
                rich_text: [{ plain_text: 'test-user-id' }]
              }
            }
          } as PageObjectResponse
        ]
      })
    },
    pages: {
      create: vi.fn().mockResolvedValue({
        id: 'new-page-id',
        properties: {}
      } as PageObjectResponse),
      update: vi.fn().mockResolvedValue({
        id: 'updated-page-id',
        properties: {}
      } as PageObjectResponse)
    }
  }))
}));

describe('Notion API', () => {
  const notion = new Client({ auth: 'test-token' });

  it('should query database successfully', async () => {
    const response = await notion.databases.query({
      database_id: 'test-db-id'
    });

    expect(response.results).toHaveLength(1);
    expect(response.results[0].id).toBe('test-page-id');
  });

  it('should create page successfully', async () => {
    const response = await notion.pages.create({
      parent: { database_id: 'test-db-id' },
      properties: {
        Title: {
          title: [{ text: { content: 'New Quest' } }]
        }
      }
    });

    expect(response.id).toBe('new-page-id');
  });

  it('should update page successfully', async () => {
    const response = await notion.pages.update({
      page_id: 'test-page-id',
      properties: {
        Status: {
          select: { name: 'Done' }
        }
      }
    });

    expect(response.id).toBe('updated-page-id');
  });
}); 