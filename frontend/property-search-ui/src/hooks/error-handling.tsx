'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// エラーハンドリングコンポーネント
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Uncaught error:', error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">エラーが発生しました</h2>
          <p className="text-gray-700 mb-4">
            申し訳ありませんが、予期しないエラーが発生しました。
          </p>
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          )}
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ページを再読み込み
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// API エラーハンドリングフック
export function useApiErrorHandler() {
  const [error, setError] = useState<string | null>(null);

  const handleApiError = (err: unknown) => {
    console.error('API Error:', err);
    
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'string') {
      setError(err);
    } else {
      setError('不明なエラーが発生しました');
    }
    
    return error;
  };

  const clearError = () => setError(null);

  return {
    error,
    handleApiError,
    clearError
  };
}

// ネットワークステータスモニタリングフック
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// API リクエストリトライフック
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const executeApiCall = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      setData(result);
      setRetryCount(0);
      return result;
    } catch (err) {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        
        // 指数バックオフでリトライ
        const delay = retryDelay * Math.pow(2, retryCount);
        
        setTimeout(() => {
          executeApiCall();
        }, delay);
      } else {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeApiCall();
  }, []);

  return {
    data,
    loading,
    error,
    retry: executeApiCall,
    retryCount
  };
}
