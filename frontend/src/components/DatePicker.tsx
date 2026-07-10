import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  min?: string; // YYYY-MM-DD
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min = '',
  placeholder = 'Select date',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize displayed month/year based on selected value or current date
  const [navDate, setNavDate] = useState(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
      }
    }
    return new Date();
  });

  const year = navDate.getFullYear();
  const month = navDate.getMonth(); // 0-indexed

  // Sync navDate with selected value if selected value changes from outside
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setNavDate(new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
      }
    }
  }, [value]);

  // Click outside handler to dismiss calendar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date helper for comparison/selection (YYYY-MM-DD)
  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Helper to format selected date for display
  const getDisplayValue = () => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const y = parts[0];
      const m = months[parseInt(parts[1], 10) - 1];
      const d = parseInt(parts[2], 10);
      return `${m} ${d}, ${y}`;
    }
    return value;
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6)

  // Generate day items
  const days = [];
  // Empty slots for previous month padding
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const handlePrevMonth = () => {
    setNavDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedStr = formatDateString(year, month, day);
    onChange(selectedStr);
    setIsOpen(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Trigger Button/Input */}
      <div 
        className="form-input"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          position: 'relative'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-main)' : 'var(--text-dark)' }}>
          {getDisplayValue() || placeholder}
        </span>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--primary)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ transition: 'transform 0.2s ease' }}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>

        {/* Hidden input to support HTML5 standard validation */}
        <input 
          type="text" 
          value={value} 
          required={required} 
          readOnly 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1
          }} 
        />
      </div>

      {isOpen && (
        <div 
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 999,
            width: '320px',
            padding: '16px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
          }}
        >
          {/* Calendar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-small"
              style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handlePrevMonth}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>
              {monthNames[month]} {year}
            </span>
            
            <button 
              type="button"
              className="btn btn-secondary btn-small"
              style={{ padding: '6px 8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleNextMonth}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          {/* Weekdays Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
            {weekdayNames.map(day => (
              <span key={day} style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dayStr = formatDateString(year, month, day);
              const isToday = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === dayStr;
              const isSelected = value === dayStr;
              const isDisabled = min && dayStr < min;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={!!isDisabled}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    background: isSelected 
                      ? 'var(--primary)' 
                      : isToday 
                        ? 'rgba(168, 85, 247, 0.15)' 
                        : 'transparent',
                    color: isSelected 
                      ? '#fff' 
                      : isDisabled 
                        ? 'var(--text-dark)' 
                        : 'var(--text-main)',
                    border: isToday && !isSelected 
                      ? '1px solid var(--primary)' 
                      : 'none',
                    borderRadius: '6px',
                    padding: '8px 0',
                    fontSize: '0.85rem',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontWeight: isSelected || isToday ? 'bold' : 'normal',
                    transition: 'all 0.2s',
                    opacity: isDisabled ? 0.35 : 1,
                  }}
                  className={!isDisabled && !isSelected ? 'date-picker-day-hover' : ''}
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
