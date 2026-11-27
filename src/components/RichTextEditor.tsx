'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Quote,
  Link2,
  Subscript,
  Superscript,
  IndentDecrease,
  IndentIncrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ListOrdered,
  List,
  RemoveFormatting,
  Check,
  X,
} from 'lucide-react';
import { formatArticleHtml } from '@/lib/formatArticleHtml';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your article content here...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const isInternalChangeRef = useRef(false);

  const [blockFormat, setBlockFormat] = useState('P');
  const [fontFamily, setFontFamily] = useState('Sans Serif');
  const [textColor, setTextColor] = useState('#111827');
  const [alignMode, setAlignMode] = useState<'left' | 'center' | 'right'>('left');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  // Initialize / sync external value (e.g. when switching from HTML/Markdown tab)
  useEffect(() => {
    if (!editorRef.current) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const formatted = value.trim() ? formatArticleHtml(value) : '';
    if (editorRef.current.innerHTML !== formatted) {
      editorRef.current.innerHTML = formatted;
    }
  }, [value]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const emitChange = () => {
    if (!editorRef.current) return;
    isInternalChangeRef.current = true;
    const html = editorRef.current.innerHTML;
    // Treat empty <br> or empty tags as empty string
    const textOnly = editorRef.current.textContent?.trim() || '';
    if (!textOnly && !/<img|<hr|<iframe/i.test(html)) {
      onChange('');
    } else {
      onChange(html);
    }
  };

  const exec = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    saveSelection();
    emitChange();
  };

  const handleBlockChange = (tag: string) => {
    setBlockFormat(tag);
    exec('formatBlock', tag === 'P' ? '<p>' : `<${tag.toLowerCase()}>`);
  };

  const handleFontChange = (font: string) => {
    setFontFamily(font);
    const fontMap: Record<string, string> = {
      'Sans Serif': 'Inter, system-ui, -apple-system, sans-serif',
      Serif: 'Georgia, Cambria, "Times New Roman", serif',
      Monospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    };
    exec('fontName', fontMap[font] || fontMap['Sans Serif']);
  };

  const handleAlignCycle = () => {
    const next =
      alignMode === 'left' ? 'center' : alignMode === 'center' ? 'right' : 'left';
    setAlignMode(next);
    exec(
      next === 'left'
        ? 'justifyLeft'
        : next === 'center'
        ? 'justifyCenter'
        : 'justifyRight'
    );
  };

  const handleOpenLinkBar = () => {
    saveSelection();
    setShowLinkInput((prev) => !prev);
  };

  const handleApplyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      setShowLinkInput(false);
      return;
    }
    const normalizedUrl = /^https?:\/\//i.test(url) || url.startsWith('/') ? url : `https://${url}`;
    editorRef.current?.focus();
    restoreSelection();
    const sel = window.getSelection();
    if (sel && sel.isCollapsed) {
      document.execCommand(
        'insertHTML',
        false,
        `<a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer">${normalizedUrl}</a>`
      );
    } else {
      document.execCommand('createLink', false, normalizedUrl);
    }
    emitChange();
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const toolbarBtnClass =
    'w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-[#111827] hover:bg-slate-200/70 transition-colors cursor-pointer';

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden focus-within:border-[#E30613] focus-within:ring-2 focus-within:ring-[#E30613]/15 transition-all">
      {/* Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-3 py-2 space-y-1.5">
        {/* Row 1: Basic formatting, Blockquote, Heading, Font */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            title="Bold (Ctrl+B)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
            className={toolbarBtnClass}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Italic (Ctrl+I)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('italic')}
            className={toolbarBtnClass}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Underline (Ctrl+U)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('underline')}
            className={toolbarBtnClass}
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Blockquote"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('formatBlock', '<blockquote>')}
            className={toolbarBtnClass}
          >
            <Quote className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1.5" />

          {/* Heading / Block Selector */}
          <select
            value={blockFormat}
            onMouseDown={saveSelection}
            onChange={(e) => handleBlockChange(e.target.value)}
            aria-label="Text style"
            className="h-8 px-2.5 rounded-lg border border-slate-200/80 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#E30613] cursor-pointer"
          >
            <option value="P">Normal</option>
            <option value="H1">Heading 1</option>
            <option value="H2">Heading 2</option>
            <option value="H3">Heading 3</option>
            <option value="H4">Heading 4</option>
          </select>

          {/* Font Family Selector */}
          <select
            value={fontFamily}
            onMouseDown={saveSelection}
            onChange={(e) => handleFontChange(e.target.value)}
            aria-label="Font family"
            className="h-8 px-2.5 rounded-lg border border-slate-200/80 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-[#E30613] cursor-pointer"
          >
            <option value="Sans Serif">Sans Serif</option>
            <option value="Serif">Serif</option>
            <option value="Monospace">Monospace</option>
          </select>
        </div>

        {/* Row 2: Link, Sub/Sup, Indent, Align, Lists, Color, Clear Formatting */}
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <button
            type="button"
            title="Insert Link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleOpenLinkBar}
            className={`${toolbarBtnClass} ${showLinkInput ? 'bg-slate-200 text-[#111827]' : ''}`}
          >
            <Link2 className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            title="Subscript"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('subscript')}
            className={toolbarBtnClass}
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Superscript"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('superscript')}
            className={toolbarBtnClass}
          >
            <Superscript className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            title="Decrease Indent"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('outdent')}
            className={toolbarBtnClass}
          >
            <IndentDecrease className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Increase Indent"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('indent')}
            className={toolbarBtnClass}
          >
            <IndentIncrease className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            title={`Align (${alignMode})`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleAlignCycle}
            className={toolbarBtnClass}
          >
            {alignMode === 'center' ? (
              <AlignCenter className="w-4 h-4" />
            ) : alignMode === 'right' ? (
              <AlignRight className="w-4 h-4" />
            ) : (
              <AlignLeft className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            title="Numbered List"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertOrderedList')}
            className={toolbarBtnClass}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Bullet List"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertUnorderedList')}
            className={toolbarBtnClass}
          >
            <List className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-slate-200 mx-1" />

          {/* Text Color Picker */}
          <label
            title="Text Color"
            onMouseDown={saveSelection}
            className={`${toolbarBtnClass} relative flex-col gap-0.5`}
          >
            <span className="text-xs font-bold leading-none">A</span>
            <span
              className="w-3.5 h-0.5 rounded-full"
              style={{ backgroundColor: textColor }}
            />
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                setTextColor(e.target.value);
                exec('foreColor', e.target.value);
              }}
              className="sr-only"
            />
          </label>

          {/* Clear Formatting */}
          <button
            type="button"
            title="Clear Formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('removeFormat')}
            className={toolbarBtnClass}
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
        </div>

        {/* Inline Link Input */}
        {showLinkInput && (
          <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-200/70">
            <input
              type="url"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyLink();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setShowLinkInput(false);
                }
              }}
              placeholder="https://example.com"
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-2.5 py-1.5 rounded-lg bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Editable Area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={() => {
            saveSelection();
            emitChange();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          data-placeholder={placeholder}
          className="article-content min-h-[320px] max-h-[520px] overflow-y-auto p-4 sm:p-5 text-sm text-slate-800 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
        />
      </div>
    </div>
  );
}
