'use client';

import React from 'react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false 
}) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisible = 5;

  const getVisiblePages = () => {
    if (totalPages <= maxVisible) return pages;
    const start = Math.max(0, Math.min(currentPage - Math.ceil(maxVisible / 2), totalPages - maxVisible));
    return pages.slice(start, start + maxVisible);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center space-x-2 font-sans select-none scale-90 sm:scale-100">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="p-1.5 focus:ring-0 active:scale-95"
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </Button>
      
      {visiblePages[0] > 1 && (
        <>
          <PaginationButton page={1} current={currentPage} onClick={onPageChange} disabled={isLoading} />
          {visiblePages[0] > 2 && <span className="text-gray-400 font-black tracking-widest px-1">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <PaginationButton
          key={page}
          page={page}
          current={currentPage}
          onClick={onPageChange}
          disabled={isLoading}
        />
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="text-gray-400 font-black tracking-widest px-1">...</span>}
          <PaginationButton page={totalPages} current={currentPage} onClick={onPageChange} disabled={isLoading} />
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="p-1.5 focus:ring-0 active:scale-95"
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

const PaginationButton = ({ page, current, onClick, disabled }: { page: number; current: number; onClick: (page: number) => void; disabled: boolean }) => (
  <button
    onClick={() => onClick(page)}
    disabled={disabled}
    className={`
      w-10 h-10 flex items-center justify-center text-xs font-black rounded-lg transition-all duration-300
      ${current === page 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-2 ring-blue-600/20 transform scale-110' 
        : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10'
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    {page}
  </button>
);
