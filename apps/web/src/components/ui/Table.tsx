'use client';

import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function Table<T extends { id?: string | number; _id?: string | number }>({ 
  data, 
  columns, 
  onRowClick, 
  isLoading = false 
}: TableProps<T>) {
  return (
    <div className="w-full overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent relative">
        <table className="w-full text-left font-sans border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-4 text-[11px] font-black text-gray-500 uppercase tracking-[0.1em] select-none ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {isLoading && data.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded-lg w-full scale-y-75"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              <>
                {data.map((item) => (
                  <tr
                    key={item.id || item._id}
                    onClick={() => onRowClick?.(item)}
                    className={`
                      group transition-all duration-300 hover:bg-blue-50/30
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isLoading ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}
                    `}
                  >
                    {columns.map((column, index) => (
                      <td 
                        key={index} 
                        className={`px-4 py-3 text-sm font-bold text-gray-900 tracking-tight transition-colors group-hover:text-amber-900 border-none ${column.className || ''}`}
                      >
                        {typeof column.accessor === 'function'
                          ? column.accessor(item)
                          : (item[column.accessor] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] bg-gray-50/10 italic"
                >
                  No records matching the current parameters
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {isLoading && data.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 pointer-events-none z-10">
            <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}
