'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setIsSuccess(true);
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      setError('비밀번호 재설정 이메일을 보내는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">이메일 전송 완료</h2>
        <p className="text-gray-600 mb-4">
          비밀번호 재설정 링크가 이메일로 전송되었습니다.
          이메일을 확인해주세요.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">비밀번호 재설정</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 mb-4">{error}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '처리중...' : '비밀번호 재설정 이메일 보내기'}
        </button>
      </form>
      <button
        onClick={() => router.push('/login')}
        className="w-full mt-4 text-gray-600 hover:text-gray-800"
      >
        로그인으로 돌아가기
      </button>
    </div>
  );
} 