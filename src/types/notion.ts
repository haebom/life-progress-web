export type NotionPropertyType = 'title' | 'select' | 'date' | 'rich_text' | 'number';

export type QuestStatus = 'active' | 'completed' | 'failed';

export interface QuestItem {
  id: string;
  title: string;
  status: QuestStatus;
  startedAt?: string;
  completedAt?: string;
  userId: string;
  progress: number;
} 