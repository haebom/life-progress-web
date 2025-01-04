'use client';

import { QuestCard } from '@/components/QuestCard';
import type { Quest } from '@/types';

interface QuestListProps {
  quests: Quest[];
  onQuestUpdate: (quest: Quest) => void;
  onQuestDelete: (questId: string) => void;
  onQuestLike?: (questId: string) => void;
}

export function QuestList({ quests, onQuestUpdate, onQuestDelete, onQuestLike }: QuestListProps) {
  const handleEdit = (quest: Quest) => {
    onQuestUpdate(quest);
  };

  const handleDelete = (questId: string) => {
    onQuestDelete(questId);
  };

  const handleLike = (questId: string) => {
    onQuestLike?.(questId);
  };

  return (
    <div className="space-y-4">
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onEdit={() => handleEdit(quest)}
          onDelete={() => handleDelete(quest.id)}
          onLike={() => handleLike(quest.id)}
          isLiked={false}
          likeCount={0}
        />
      ))}
    </div>
  );
} 