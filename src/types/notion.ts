export interface QuestItem {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  startedAt?: string;
  completedAt?: string;
  userId: string;
} 