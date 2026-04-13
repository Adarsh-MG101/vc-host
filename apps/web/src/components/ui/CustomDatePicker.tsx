import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = "Created After" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    // Format to YYYY-MM-DD
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12).toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const selectedDate = value ? new Date(value) : null;
  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth.getMonth() &&
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === currentMonth.getMonth() &&
           today.getFullYear() === currentMonth.getFullYear();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-[200px] px-4 py-3.5 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center justify-between cursor-pointer group transition-all hover:border-gray-200"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <CalendarIcon size={16} className={value ? "text-brand-navy" : "text-gray-400 group-hover:text-gray-600"} />
          <span className={`text-sm font-medium truncate ${value ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {value ? new Date(value).toLocaleDateString() : placeholder}
          </span>
        </div>
        
        {value && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute top-[110%] left-0 z-50 bg-white border border-gray-100 rounded-xl shadow-2xl p-4 w-[280px]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"><ChevronRight size={18} /></button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[10px] font-black uppercase text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for non-1st start days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8"></div>
            ))}
            
            {/* Actuall Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-8 w-full rounded-md text-xs font-bold transition-all flex items-center justify-center
                    ${selected 
                      ? 'bg-brand-navy text-white shadow-md' 
                      : today 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
