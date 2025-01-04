'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { Firebase } from '@/lib/firebase';
import { Quest } from '@/types';

export default function QuestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [sharedQuests, setSharedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'shared'>('my');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Quest['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate'>('createdAt');
  const [notionConnected, setNotionConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    const fetchQuests = async () => {
      try {
        setLoading(true);
        setError(null);

        // 내 퀘스트 가져오기
        const myQuestsQuery = query(
          collection(Firebase.db, 'quests'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const myQuestsSnapshot = await getDocs(myQuestsQuery);
        const myQuestsData = myQuestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quest[];
        
        setQuests(myQuestsData);

        // 공유된 퀘스트 가져오기 (수정된 쿼리)
        const sharedQuestsQuery = query(
          collection(Firebase.db, 'quests'),
          where('isShared', '==', true),
          orderBy('createdAt', 'desc')
        );
        
        const sharedQuestsSnapshot = await getDocs(sharedQuestsQuery);
        const sharedQuestsData = sharedQuestsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Quest))
          .filter(quest => quest.userId !== user.uid);
        
        setSharedQuests(sharedQuestsData);

        // Notion 연동 상태 확인
        const response = await fetch('/api/auth/notion/check');
        const data = await response.json();
        setNotionConnected(data.connected);
      } catch (error) {
        console.error('퀘스트 로딩 실패:', error);
        
        if (error instanceof FirebaseError) {
          if (error.message.includes('requires an index')) {
            setError(`인덱스 설정이 필요합니다. 다음 필드에 대한 인덱스를 생성해주세요:
              - Collection: quests
              - Fields: isShared (Ascending), createdAt (Descending)`);
          } else {
            setError(`Firebase 오류: ${error.message}`);
          }
        } else {
          setError('퀘스트를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [user, authLoading, router]);

  // 인증 로딩 중일 때의 UI
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 로그인되지 않은 경우의 UI
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <p className="text-gray-600">로그인이 필요한 페이지입니다.</p>
          <Button 
            onClick={() => router.push('/login')}
            className="mt-4"
          >
            로그인하기
          </Button>
        </Card>
      </div>
    );
  }

  // 데이터 로딩 중일 때의 UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러 발생 시의 UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="mt-4"
          >
            대시보드로 돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const displayQuests = activeTab === 'my' ? quests : sharedQuests;

  const filteredQuests = displayQuests
    .filter(quest => {
      const matchesSearch = 
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || quest.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.toDate().getTime() - a.dueDate.toDate().getTime();
      }
      return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });

  return (
    <div className="container mx-auto px-4 py-8">
      {notionConnected === false && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Notion 연동이 필요합니다</h2>
          <p className="text-blue-600 mb-4">퀘스트를 관리하기 위해 Notion 워크스페이스와 연동해주세요.</p>
          <button
            onClick={() => router.push('/api/auth/notion')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Notion 연동하기
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">목표 관리</h1>
        <Button onClick={() => router.push('/quests/new')}>
          새 목표 추가
        </Button>
      </div>

      <div className="flex space-x-4 mb-6">
        <Button
          variant={activeTab === 'my' ? 'default' : 'outline'}
          onClick={() => setActiveTab('my')}
          className="flex-1"
        >
          내 목표 ({quests.length})
        </Button>
        <Button
          variant={activeTab === 'shared' ? 'default' : 'outline'}
          onClick={() => setActiveTab('shared')}
          className="flex-1"
        >
          공유된 목표 ({sharedQuests.length})
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="제목, 설명, 태그로 검색"
              className="w-full p-2 border rounded-md pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex gap-2 md:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Quest['status'] | 'all')}
              className="p-2 border rounded-md min-w-[120px]"
            >
              <option value="all">모든 상태</option>
              <option value="active">진행 중</option>
              <option value="completed">완료</option>
              <option value="failed">실패</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'dueDate')}
              className="p-2 border rounded-md min-w-[120px]"
            >
              <option value="createdAt">최신순</option>
              <option value="dueDate">마감임박순</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredQuests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 text-center text-gray-500">
                {searchTerm
                  ? '검색 결과가 없습니다.'
                  : activeTab === 'my'
                  ? '등록된 목표가 없습니다.'
                  : '공유된 목표가 없습니다.'}
              </Card>
            </motion.div>
          ) : (
            filteredQuests.map((quest, index) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <h3 className="text-xl font-semibold mb-2">{quest.title}</h3>
                  <p className="text-gray-600 mb-4">{quest.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quest.tags?.map((tag: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4">
                      <span className="text-sm text-gray-500">
                        {quest.createdAt.toDate().toLocaleDateString()}
                      </span>
                      {quest.dueDate && (
                        <span className="text-sm text-red-500">
                          마감: {quest.dueDate.toDate().toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      {quest.progress !== undefined && (
                        <span className="text-sm text-blue-600">
                          진행률: {quest.progress}%
                        </span>
                      )}
                      <span className={`text-sm ${quest.isShared ? 'text-green-500' : 'text-gray-500'}`}>
                        {quest.isShared ? '공개' : '비공개'}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 