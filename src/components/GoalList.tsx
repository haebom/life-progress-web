'use client';

import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { BlockCard } from '@/components/blocks/BlockCard';
import { BlockEditor } from '@/components/BlockEditor';
import type { Quest, Block } from '@/types';

interface GoalListProps {
  quests: Quest[];
  onQuestUpdate: (quest: Quest) => void;
  onQuestDelete: (questId: string) => void;
}

export function GoalList({ quests, onQuestUpdate, onQuestDelete }: GoalListProps) {
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  const questToBlock = (quest: Quest): Block => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    status: quest.status,
    progress: quest.progress,
    dueDate: quest.dueDate,
    createdAt: quest.createdAt,
    updatedAt: quest.updatedAt,
  });

  const blockToQuest = (block: Partial<Block>, quest: Quest): Quest => ({
    ...quest,
    title: block.title || quest.title,
    description: block.description || quest.description,
    status: block.status || quest.status,
    progress: block.progress ?? quest.progress,
    dueDate: block.dueDate,
    updatedAt: block.updatedAt || Timestamp.now(),
  });

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
  };

  const handleSave = (block: Partial<Block>) => {
    if (!editingQuest) return;
    const updatedQuest = blockToQuest(block, editingQuest);
    onQuestUpdate(updatedQuest);
    setEditingQuest(null);
  };

  const handleCancel = () => {
    setEditingQuest(null);
  };

  const handleDelete = (questId: string) => {
    onQuestDelete(questId);
  };

  return (
    <div className="space-y-4">
      {quests.map((quest) => (
        <div key={quest.id}>
          {editingQuest?.id === quest.id ? (
            <BlockEditor
              block={questToBlock(quest)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <BlockCard
              block={questToBlock(quest)}
              onEdit={() => handleEdit(quest)}
              onDelete={() => handleDelete(quest.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
} 