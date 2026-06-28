'use client';
import { useState, useEffect, useRef } from 'react';
import apiClient from '@/utils/apiClient';

export default function NotesPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(400);
  const [position, setPosition] = useState({ bottom: 80, left: 16 });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<{
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startBottom: number;
    startLeft: number;
  } | null>(null);
  const dragState = useRef<{ startX: number; startY: number } | null>(null);

  useEffect(() => {
    if (isOpen && !loaded) {
      apiClient('/api/notes')
        .then((res: any) => {
          setContent(res.content || '');
          setLoaded(true);
        })
        .catch((err: any) => console.error('Failed to load notes', err));
    }
  }, [isOpen, loaded]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setSaving(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      apiClient('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ content: val })
      })
        .then(() => setSaving(false))
        .catch(() => setSaving(false));
    }, 1000);
  };

  const handleResizeDown = (handle: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    resizeState.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: width,
      startHeight: height,
      startBottom: position.bottom,
      startLeft: position.left
    };
  };

  const handleDragDown = (e: React.MouseEvent) => {
    if (isOpen || (e.target as HTMLElement).closest('[data-no-drag]')) return;
    dragState.current = { startX: e.clientX, startY: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.current && !isOpen) {
        const deltaX = e.clientX - dragState.current.startX;
        const deltaY = e.clientY - dragState.current.startY;

        setPosition(p => ({
          bottom: p.bottom - deltaY,
          left: p.left + deltaX
        }));

        dragState.current = { startX: e.clientX, startY: e.clientY };
      }

      if (resizeState.current) {
        const { handle, startX, startY, startWidth, startHeight, startBottom, startLeft } = resizeState.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (handle === 'tl') {
          const newWidth = Math.max(250, startWidth - deltaX);
          const newHeight = Math.max(300, startHeight - deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom + deltaY,
            left: startLeft + deltaX
          });
        } else if (handle === 'tr') {
          const newWidth = Math.max(250, startWidth + deltaX);
          const newHeight = Math.max(300, startHeight - deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom + deltaY,
            left: startLeft
          });
        } else if (handle === 'bl') {
          const newWidth = Math.max(250, startWidth - deltaX);
          const newHeight = Math.max(300, startHeight + deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom,
            left: startLeft + deltaX
          });
        } else if (handle === 'br') {
          const newWidth = Math.max(250, startWidth + deltaX);
          const newHeight = Math.max(300, startHeight + deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom,
            left: startLeft
          });
        }
      }
    };

    const handleMouseUp = () => {
      resizeState.current = null;
      dragState.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen]);

  return (
    <>
      {/* Collapsed pebble trigger — shown only when not open */}
      {!isOpen && (
        <div
          ref={containerRef}
          onMouseDown={handleDragDown}
          className="fixed pebble-popup-trigger"
          style={{
            zIndex: 9999,
            width: '64px',
            height: '64px',
            bottom: `${position.bottom}px`,
            left: `${position.left}px`,
            borderRadius: '38% 62% 55% 45% / 55% 45% 55% 45%',
          }}
        >
          <button
            onClick={() => setIsOpen(true)}
            data-no-drag
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              lineHeight: 1,
            }}
            title="Open My Notes"
            aria-label="Open My Notes"
          >
            📝
          </button>
        </div>
      )}

      {/* Expanded notes panel */}
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed pebble-notes-panel flex flex-col"
          style={{
            zIndex: 9999,
            width: `${width}px`,
            height: `${height}px`,
            bottom: `${position.bottom}px`,
            left: `${position.left}px`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-move"
            style={{
              background: 'linear-gradient(135deg, rgba(254,215,170,0.20), rgba(167,243,208,0.15))',
              borderBottom: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '20px 24px 0 0',
            }}
            onMouseDown={handleDragDown}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '20px' }}>📝</span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #92400e, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.01em',
                }}
              >
                My Notes
              </span>
              {saving && (
                <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>
                  saving…
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              data-no-drag
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(245,158,11,0.12)',
                color: '#b45309',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.22)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(245,158,11,0.12)')}
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-0 flex flex-col" data-no-drag>
            <textarea
              className="flex-1 w-full outline-none resize-none custom-scrollbar"
              placeholder="Paste or type your notes here… They're automatically saved."
              value={content}
              onChange={handleChange}
              data-no-drag
              style={{
                background: 'rgba(255,251,240,0.60)',
                color: '#1a1a1a',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                lineHeight: 1.75,
                padding: '14px 16px',
                border: 'none',
                borderRadius: '0 0 20px 24px',
                flex: 1,
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.10) inset')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
            />
          </div>
        </div>
      )}
    </>
  );
}
