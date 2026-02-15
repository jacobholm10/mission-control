import { useEffect, useRef } from 'react';
import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';

const typeColors = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
};

const typeBadgeColors = {
  info: 'bg-blue-500/20 text-blue-400',
  warning: 'bg-amber-500/20 text-amber-400',
  error: 'bg-red-500/20 text-red-400',
  success: 'bg-emerald-500/20 text-emerald-400',
};

export default function ThoughtStream({ logs, isOpen, setIsOpen }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className={`bg-black border-t border-slate-800 flex flex-col shrink-0 transition-all duration-300 ${isOpen ? 'h-56' : 'h-8'}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-300 bg-slate-900/80 border-b border-slate-800 cursor-pointer shrink-0"
      >
        <Terminal size={12} />
        <span className="font-mono">Thought Stream</span>
        <span className="text-[10px] font-mono text-slate-600">{logs.length} events</span>
        <div className="flex-1" />
        {isOpen ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
      </button>

      {/* Logs */}
      {isOpen && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 py-0.5 hover:bg-slate-900/30">
              <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`px-1 rounded text-[9px] font-bold uppercase shrink-0 ${typeBadgeColors[log.type]}`}>
                {log.type.slice(0, 4)}
              </span>
              <span className={typeColors[log.type]}>{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-600 text-center py-4">Waiting for events...</div>
          )}
        </div>
      )}
    </div>
  );
}
