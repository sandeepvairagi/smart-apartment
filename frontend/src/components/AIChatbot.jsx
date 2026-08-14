import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/chatService';
import { useAuth } from '../context/AuthContext';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 Hi! I am your **Smart Apartment AI Assistant**. How can I help you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const { user } = useAuth();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getQuickPrompts = () => {
    const role = user?.role;
    if (role === 'resident') {
      return [
        '📦 Check my couriers',
        '👥 Expected visitors',
        '📢 Latest notices',
        '🛠️ My complaints',
        '🚨 Emergency contacts',
      ];
    }
    if (role === 'guard') {
      return [
        '📦 Active parcels at gate',
        '🛡️ Today visitor stats',
        '🚨 Security desk emergency',
      ];
    }
    return [
      '📦 Courier & parcel rules',
      '👥 Visitor registration help',
      '📢 Society announcements',
      '🚨 Emergency contacts',
    ];
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const { data } = await sendChatMessage(text);
      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: '⚠️ Sorry, I am having trouble connecting right now. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedText = (text) => {
    // Simple markdown formatting helper (bold, bullet points, line breaks)
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      // Bold **text**
      const parts = formatted.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-[var(--color-ink)]">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-[var(--color-ink-muted)]">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      return (
        <span key={idx} className="block min-h-[1.2em]">
          {renderedParts}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="mb-3 flex h-[520px] w-[350px] sm:w-[400px] flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-bold shadow-md">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-ink)]">Smart AI Assistant</h3>
                <p className="text-[11px] text-[var(--color-success)] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span> Online & Database Connected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      text: '👋 Hi! Chat history cleared. How can I help you today?',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ])
                }
                title="Clear Chat"
                className="rounded-lg p-1.5 text-xs text-[var(--color-ink-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-ink)]"
              >
                🗑️
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-xs font-bold text-[var(--color-ink-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-ink)]"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-br-none'
                      : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] rounded-bl-none'
                  }`}
                >
                  {renderFormattedText(m.text)}
                </div>
                <span className="mt-1 text-[10px] text-[var(--color-ink-muted)] px-1">
                  {m.time}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[var(--color-ink-muted)] italic text-xs">
                <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-ping"></span>
                AI Assistant is thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] scrollbar-none">
            {getQuickPrompts().map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2.5 rounded-b-2xl"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about parcels, visitors, notices..."
              className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white text-xs font-bold disabled:opacity-50 hover:bg-[var(--color-accent-hover)] transition"
            >
              ➔
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-3 text-white shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        <span className="text-lg">🤖</span>
        <span className="text-xs font-bold tracking-wide">
          {isOpen ? 'Close Assistant' : 'AI Assistant'}
        </span>
        {!isOpen && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        )}
      </button>
    </div>
  );
}

export default AIChatbot;
