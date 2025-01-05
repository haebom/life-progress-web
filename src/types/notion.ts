export interface QuestItem {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  userId: string;
  progress?: number;
} 