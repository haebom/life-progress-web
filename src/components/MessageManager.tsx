import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';
import { addInspirationMessage, deleteMessage, getUserMessages, type InspirationMessage } from '@/lib/messages';

export function MessageManager() {
  const { user } = useStore();
  const [messages, setMessages] = useState<InspirationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 메시지 목록 로드
  useEffect(() => {
    if (user?.uid) {
      loadMessages();
    }
  }, [user?.uid]);

  const loadMessages = async () => {
    if (!user?.uid) return;
    try {
      const userMessages = await getUserMessages(user.uid);
      setMessages(userMessages);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  // 새 메시지 추가
  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !newMessage.trim()) return;

    setIsLoading(true);
    try {
      await addInspirationMessage(user.uid, newMessage.trim());
      setNewMessage('');
      await loadMessages(); // 목록 새로고침
    } catch (error) {
      console.error('메시지 추가 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 삭제
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('이 메시지를 삭제하시겠습니까?')) return;

    try {
      await deleteMessage(messageId);
      await loadMessages(); // 목록 새로고침
    } catch (error) {
      console.error('메시지 삭제 실패:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">나만의 동기부여 메시지</h2>
      
      <form onSubmit={handleAddMessage} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="새로운 메시지를 입력하세요"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <p className="flex-1 mr-4">{msg.message}</p>
            <button
              onClick={() => msg.id && handleDeleteMessage(msg.id)}
              className="text-red-500 hover:text-red-600"
            >
              삭제
            </button>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-center text-gray-500">
            아직 추가된 메시지가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
} 