import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client';

export interface QuestItem {
  id: string;
  title: string;
  status: 'active' | 'completed';
  startedAt?: string;
  completedAt?: string;
  userId: string;
  progress: number;
}

class NotionClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      auth: process.env.NOTION_API_KEY
    });
  }

  async getQuests(userId: string): Promise<QuestItem[]> {
    // Coming Soon: Notion 연동 기능은 나중에 구현될 예정입니다.
    console.log('Notion getQuests called for userId:', userId);
    return [];
  }

  async createQuest(quest: Omit<QuestItem, 'id'>): Promise<QuestItem> {
    // Coming Soon: Notion 연동 기능은 나중에 구현될 예정입니다.
    console.log('Notion createQuest called with:', quest);
    return {
      id: 'temp-id',
      ...quest
    };
  }

  async updateQuest(questId: string, updates: Partial<QuestItem>): Promise<QuestItem> {
    // Coming Soon: Notion 연동 기능은 나중에 구현될 예정입니다.
    console.log('Notion updateQuest called for questId:', questId, 'with updates:', updates);
    return {
      id: questId,
      title: 'Temporary Quest',
      status: 'active',
      userId: updates.userId || '',
      progress: 0
    };
  }

  async deleteQuest(questId: string): Promise<void> {
    // Coming Soon: Notion 연동 기능은 나중에 구현될 예정입니다.
    console.log('Notion deleteQuest called for questId:', questId);
  }
}

export const Notion = new NotionClient(); 