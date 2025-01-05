import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Notion } from '../notion';
import type { QuestItem } from '@/types/notion';

// Notion 클라이언트 모의 객체
vi.mock('@notionhq/client', () => ({
  Client: vi.fn(() => ({
    databases: {
      query: vi.fn(),
    },
    pages: {
      properties: {
        retrieve: vi.fn(),
      },
    },
  })),
}));

describe('Notion Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getQuests', () => {
    it('퀘스트 목록을 성공적으로 가져와야 함', async () => {
      const mockDatabaseResponse = {
        results: [
          {
            id: 'quest-1',
            properties: {},
          },
          {
            id: 'quest-2',
            properties: {},
          },
        ],
      };

      const mockPropertyResponses: Record<string, Record<string, any>> = {
        'quest-1': {
          title: { type: 'title', title: [{ plain_text: '퀘스트 1' }] },
          status: { type: 'select', select: { name: 'In Progress' } },
          startedAt: { type: 'date', date: { start: '2024-01-01' } },
          completedAt: { type: 'date', date: null },
          progress: { type: 'number', number: 50 },
        },
        'quest-2': {
          title: { type: 'title', title: [{ plain_text: '퀘스트 2' }] },
          status: { type: 'select', select: { name: 'Done' } },
          startedAt: { type: 'date', date: { start: '2024-01-02' } },
          completedAt: { type: 'date', date: { start: '2024-01-03' } },
          progress: { type: 'number', number: 100 },
        },
      };

      const { Client } = await import('@notionhq/client');
      const mockClient = new Client({});

      vi.mocked(mockClient.databases.query).mockResolvedValue(mockDatabaseResponse as any);
      vi.mocked(mockClient.pages.properties.retrieve).mockImplementation(async ({ page_id, property_id }) => {
        return mockPropertyResponses[page_id][property_id] as any;
      });

      const quests = await Notion.getQuests('test-user');

      expect(quests).toHaveLength(2);
      expect(quests[0]).toEqual({
        id: 'quest-1',
        title: '퀘스트 1',
        status: 'active',
        startedAt: '2024-01-01',
        completedAt: undefined,
        userId: 'test-user',
        progress: 50,
      });
      expect(quests[1]).toEqual({
        id: 'quest-2',
        title: '퀘스트 2',
        status: 'completed',
        startedAt: '2024-01-02',
        completedAt: '2024-01-03',
        userId: 'test-user',
        progress: 100,
      });
    });

    it('속성 조회 실패시 기본값을 사용해야 함', async () => {
      const mockDatabaseResponse = {
        results: [
          {
            id: 'quest-error',
            properties: {},
          },
        ],
      };

      const { Client } = await import('@notionhq/client');
      const mockClient = new Client({});

      vi.mocked(mockClient.databases.query).mockResolvedValue(mockDatabaseResponse as any);
      vi.mocked(mockClient.pages.properties.retrieve).mockRejectedValue(new Error('속성 조회 실패'));

      const quests = await Notion.getQuests('test-user');

      expect(quests).toHaveLength(1);
      expect(quests[0]).toEqual({
        id: 'quest-error',
        title: '제목 없음',
        status: 'active',
        userId: 'test-user',
        progress: 0,
      });
    });

    it('데이터베이스 조회 실패시 에러를 throw해야 함', async () => {
      const { Client } = await import('@notionhq/client');
      const mockClient = new Client({});

      vi.mocked(mockClient.databases.query).mockRejectedValue(new Error('데이터베이스 조회 실패'));

      await expect(Notion.getQuests('test-user')).rejects.toThrow('데이터베이스 조회 실패');
    });
  });
}); 