import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  variant?: 'table' | 'card' | 'text' | 'button' | 'avatar';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className = '', 
  rows = 1, 
  variant = 'text' 
}) => {
  const getSkeletonClasses = () => {
    const baseClasses = 'skeleton animate-pulse';
    
    switch (variant) {
      case 'table':
        return `${baseClasses} h-12 w-full`;
      case 'card':
        return `${baseClasses} h-32 w-full rounded-lg`;
      case 'text':
        return `${baseClasses} h-4 w-full rounded`;
      case 'button':
        return `${baseClasses} h-10 w-24 rounded-lg`;
      case 'avatar':
        return `${baseClasses} h-10 w-10 rounded-full`;
      default:
        return `${baseClasses} h-4 w-full rounded`;
    }
  };

  if (rows === 1) {
    return <div className={`${getSkeletonClasses()} ${className}`} />;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div 
          key={index} 
          className={getSkeletonClasses()}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
};

// Specialized skeleton components
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 6 
}) => (
  <div className="table-modern">
    <div className="overflow-x-auto scrollbar-modern">
      <table className="min-w-full">
        <thead className="table-header">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-4">
                <LoadingSkeleton variant="text" className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="table-row">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <LoadingSkeleton 
                    variant="text" 
                    className="h-4"
                    style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid-responsive">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card-modern p-6">
        <div className="space-y-4">
          <LoadingSkeleton variant="text" className="h-6 w-3/4" />
          <LoadingSkeleton variant="text" className="h-4 w-1/2" />
          <LoadingSkeleton variant="text" className="h-4 w-full" />
          <div className="flex space-x-2 pt-4">
            <LoadingSkeleton variant="button" />
            <LoadingSkeleton variant="button" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const MenuItemSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="space-y-8">
    {Array.from({ length: 3 }).map((_, categoryIndex) => (
      <div key={categoryIndex} className="card-modern p-6">
        <LoadingSkeleton variant="text" className="h-6 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: count }).map((_, itemIndex) => (
            <div key={itemIndex} className="card-secondary p-4">
              <div className="space-y-3">
                <LoadingSkeleton variant="text" className="h-5 w-3/4" />
                <div className="flex items-center justify-between">
                  <LoadingSkeleton variant="text" className="h-4 w-16" />
                  <div className="flex items-center space-x-3">
                    <LoadingSkeleton variant="button" className="w-8 h-8 rounded-full" />
                    <LoadingSkeleton variant="text" className="h-6 w-8" />
                    <LoadingSkeleton variant="button" className="w-8 h-8 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const StatsSkeleton: React.FC = () => (
  <div className="grid-responsive">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="card-modern p-6 text-center">
        <LoadingSkeleton variant="avatar" className="mx-auto mb-3" />
        <LoadingSkeleton variant="text" className="h-4 w-20 mx-auto mb-2" />
        <LoadingSkeleton variant="text" className="h-8 w-16 mx-auto" />
      </div>
    ))}
  </div>
);