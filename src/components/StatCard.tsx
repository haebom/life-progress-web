'use client';

import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon?: IconType;
  description?: string;
  isLoading?: boolean;
  error?: string;
  formatOptions?: {
    useAbbreviation?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  };
}

const formatNumber = (value: number, options?: StatCardProps['formatOptions']) => {
  if (options?.useAbbreviation) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
  }
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: options?.minimumFractionDigits || 0,
    maximumFractionDigits: options?.maximumFractionDigits || 0,
  });
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
  error,
  formatOptions,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
        {description && (
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatNumber(value, formatOptions)}
      </p>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
} 