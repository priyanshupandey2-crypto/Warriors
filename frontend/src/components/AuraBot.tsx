'use client';
import { useState, useRef, useEffect } from 'react';

export default function AuraBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bot' | 'user', text: string}[]>([
    { role: 'bot', text: 'Hi! I\'m AuraBot. How can I help?' },
    { role: 'bot', text: '[Browse Courses](/courses) | [Generate Course](/generate) | [Dashboard](/dashboard)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(400);
  const [position, setPosition] = useState({ bottom: 80, right: 16 });
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<{
    handle: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startBottom: number;
    startRight: number;
  } | null>(null);
  const dragState = useRef<{ startX: number; startY: number } | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e? : any) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Sorry, I am having trouble answering that.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, network error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    if (!regex.test(text)) return text;

    let parts = [];
    let lastIndex = 0;

    text.replace(regex, (match, title, url, index) => {
      if (index > lastIndex) {
        parts.push(<span key={lastIndex}>{text.substring(lastIndex, index)}</span>);
      }
      parts.push(<a key={index} href={url} className="text-blue-400 underline">{title}</a>);
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
    }

    return parts;
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
      startRight: position.right
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
          right: p.right - deltaX
        }));

        dragState.current = { startX: e.clientX, startY: e.clientY };
      }

      if (resizeState.current) {
        const { handle, startX, startY, startWidth, startHeight, startBottom, startRight } = resizeState.current;
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (handle === 'tl') {
          const newWidth = Math.max(250, startWidth - deltaX);
          const newHeight = Math.max(300, startHeight - deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom + deltaY,
            right: startRight + deltaX
          });
        } else if (handle === 'tr') {
          const newWidth = Math.max(250, startWidth + deltaX);
          const newHeight = Math.max(300, startHeight - deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom + deltaY,
            right: startRight
          });
        } else if (handle === 'bl') {
          const newWidth = Math.max(250, startWidth - deltaX);
          const newHeight = Math.max(300, startHeight + deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom,
            right: startRight + deltaX
          });
        } else if (handle === 'br') {
          const newWidth = Math.max(250, startWidth + deltaX);
          const newHeight = Math.max(300, startHeight + deltaY);
          setWidth(newWidth);
          setHeight(newHeight);
          setPosition({
            bottom: startBottom,
            right: startRight
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
            right: `${position.right}px`,
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
            title="Open AuraBot"
            aria-label="Open AuraBot"
          >
            🤖
          </button>
        </div>
      )}

      {/* Expanded chat panel */}
      {isOpen && (
        <div
          ref={containerRef}
          className="fixed pebble-chat-panel flex flex-col"
          style={{
            zIndex: 9999,
            width: `${width}px`,
            height: `${height}px`,
            bottom: `${position.bottom}px`,
            right: `${position.right}px`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-move"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(196,181,253,0.12))',
              borderBottom: '1px solid rgba(245,158,11,0.15)',
              borderRadius: '24px 16px 0 0',
            }}
            onMouseDown={handleDragDown}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '20px' }}>🤖</span>
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
                AuraBot
              </span>
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

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar"
            style={{ padding: '12px 14px' }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: m.role === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  fontSize: '13px',
                  lineHeight: 1.55,
                  background: m.role === 'bot'
                    ? 'linear-gradient(135deg, rgba(254,243,199,0.80), rgba(237,233,254,0.60))'
                    : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                  color: m.role === 'bot' ? '#3d3d3d' : '#ffffff',
                  border: m.role === 'bot' ? '1px solid rgba(245,158,11,0.18)' : 'none',
                  boxShadow: m.role === 'bot'
                    ? '0 2px 8px rgba(245,158,11,0.08)'
                    : '0 4px 12px rgba(245,158,11,0.30)',
                }}
              >
                {renderContent(m.text)}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#9ca3af', fontSize: '12px', fontStyle: 'italic' }}>
                typing…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            data-no-drag
            style={{
              display: 'flex',
              gap: '8px',
              padding: '10px 14px 14px',
              borderTop: '1px solid rgba(245,158,11,0.12)',
            }}
          >
            <input
              type="text"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: 'rgba(255,251,240,0.80)',
                border: '1.5px solid rgba(245,158,11,0.20)',
                borderRadius: '10px',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#1a1a1a',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 4px rgba(245,158,11,0.15)')}
              onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(245,158,11,0.40)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(245,158,11,0.30)',
              }}
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
