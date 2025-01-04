import QuestDetailView from '@/components/QuestDetailView';

interface QuestDetailPageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  // 정적으로 생성할 퀘스트 페이지의 id 목록
  return [
    { id: 'quest1' },
    { id: 'quest2' },
    { id: 'quest3' },
    { id: 'sample-quest' },
    { id: 'default-quest' }
  ];
}

export default function QuestDetailPage({ params }: QuestDetailPageProps) {
  return <QuestDetailView questId={params.id} />;
} 