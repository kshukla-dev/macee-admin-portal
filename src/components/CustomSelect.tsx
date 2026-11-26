'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  icon,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  required = false,
  id,
  name,
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listboxRef.current && highlightedIndex >= 0) {
      const items = listboxRef.current.children;
      if (items[highlightedIndex]) {
        (items[highlightedIndex] as HTMLElement).scrollIntoView({
          block: 'nearest',
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'Tab') {
      if (isOpen) {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
        const option = normalizedOptions[highlightedIndex];
        if (!option.disabled) {
          handleSelect(option.value);
        }
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev < normalizedOptions.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : normalizedOptions.length - 1
        );
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    // Typeahead support: search by first letter
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const char = e.key.toLowerCase();
      const matchIndex = normalizedOptions.findIndex((opt, idx) => {
        if (isOpen && idx <= highlightedIndex) return false;
        return opt.label.toLowerCase().startsWith(char);
      });

      if (matchIndex >= 0) {
        if (!isOpen) setIsOpen(true);
        setHighlightedIndex(matchIndex);
      } else {
        // Wrap around search from beginning
        const wrapIndex = normalizedOptions.findIndex((opt) =>
          opt.label.toLowerCase().startsWith(char)
        );
        if (wrapIndex >= 0) {
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(wrapIndex);
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full text-left select-none ${className}`}
    >
      {/* Hidden input for HTML form integration if name is passed */}
      {name && <input type="hidden" name={name} value={value} required={required} />}

      {/* Trigger Button with Visible Keyboard Active / Focus State */}
      <button
        ref={buttonRef}
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        className={`w-full flex items-center justify-between text-left transition-all duration-150 rounded-xl border bg-white text-xs font-medium cursor-pointer ${
          isOpen
            ? 'border-[#E30613] ring-2 ring-[#E30613]/25 shadow-xs'
            : 'border-slate-200/90 hover:border-slate-300'
        } focus:outline-none focus:ring-2 focus:ring-[#E30613]/30 focus:border-[#E30613] focus-visible:ring-2 focus-visible:ring-[#E30613]/35 focus-visible:border-[#E30613] disabled:opacity-50 disabled:cursor-not-allowed ${
          buttonClassName || 'p-2.5'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span
            className={`truncate ${
              selectedOption ? 'text-[#111827] font-medium' : 'text-slate-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-[#E30613]' : ''
          }`}
        />
      </button>

      {/* Custom Styled Dropdown Menu Popover */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${selectId}-opt-${highlightedIndex}` : undefined
          }
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl border border-slate-200/80 shadow-xl shadow-slate-900/10 py-1.5 max-h-60 overflow-y-auto animate-fadeIn ${
            menuClassName || 'min-w-[180px]'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;

            return (
              <li
                key={opt.value}
                id={`${selectId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => !opt.disabled && handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  opt.disabled
                    ? 'opacity-40 cursor-not-allowed text-slate-400'
                    : isSelected
                    ? isHighlighted
                      ? 'bg-rose-100/90 text-[#b80510] font-semibold'
                      : 'bg-rose-50/80 text-[#E30613] font-semibold'
                    : isHighlighted
                    ? 'bg-slate-100 text-[#111827] font-medium'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <span className="truncate">{opt.label}</span>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#E30613] shrink-0 ml-2" />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
