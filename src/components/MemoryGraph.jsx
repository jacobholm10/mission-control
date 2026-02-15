import { useState, useEffect } from 'react';
import { BrainCircuit, Calendar, FileText, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://134.199.194.19:3001';

function renderMarkdown(text) {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-semibold text-cyan-400 mt-3 mb-1">{line.slice(4)}</h3>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-slate-200 mt-4 mb-1">{line.slice(3)}</h2>;
    if (line.startsWith('# ')) return <h1 key={i} className="text-base font-bold text-slate-100 mt-4 mb-2">{line.slice(2)}</h1>;
    if (line.startsWith('- ')) return <li key={i} className="text-xs text-slate-400 ml-4 list-disc">{line.slice(2)}</li>;
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-xs font-semibold text-slate-300">{line.slice(2, -2)}</p>;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-xs text-slate-400 leading-relaxed">{line}</p>;
  });
}

export default function MemoryGraph() {
  const [data, setData] = useState({ memoryMd: null, dailyFiles: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDaily, setSelectedDaily] = useState(null);
  const [view, setView] = useState('timeline'); // 'timeline' | 'memory'

  const fetchMemory = () => {
    setLoading(true);
    fetch(`${API_URL}/api/memory`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({
        memoryMd: '# Memory\n\nAPI unreachable — showing placeholder.\n\n- This is mock data\n- Connect to the backend to see real memory',
        dailyFiles: [{ name: '2025-01-01.md', date: '2025-01-01', size: 512, content: '# Jan 1\n\n- Mock memory entry\n- Placeholder data' }]
      }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMemory(); }, []);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <BrainCircuit size={16} className="text-violet-400" /> Memory
          </h2>
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            <button onClick={() => setView('timeline')} className={`text-[10px] px-2 py-1 rounded cursor-pointer transition-colors ${view === 'timeline' ? 'bg-slate-700 text-slate-200' : 'text-slate-500'}`}>
              Timeline
            </button>
            <button onClick={() => setView('memory')} className={`text-[10px] px-2 py-1 rounded cursor-pointer transition-colors ${view === 'memory' ? 'bg-slate-700 text-slate-200' : 'text-slate-500'}`}>
              MEMORY.md
            </button>
          </div>
        </div>
        <button onClick={fetchMemory} className="text-slate-500 hover:text-violet-400 transition-colors cursor-pointer">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {view === 'memory' ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-violet-400" />
              <span className="text-xs font-mono text-slate-500">MEMORY.md</span>
            </div>
            <div className="prose-invert">
              {data.memoryMd ? renderMarkdown(data.memoryMd) : (
                <p className="text-xs text-slate-600">No MEMORY.md found</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-3xl mx-auto">
            {data.dailyFiles.length === 0 && !loading && (
              <div className="text-center py-12 text-slate-600 text-xs">No daily memory files found</div>
            )}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800" />
              {data.dailyFiles.map((file) => (
                <div key={file.name} className="relative pl-10 mb-4">
                  <div className="absolute left-3 top-3 w-3 h-3 rounded-full bg-violet-500/30 border-2 border-violet-500" />
                  <button
                    onClick={() => setSelectedDaily(selectedDaily === file.name ? null : file.name)}
                    className="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-violet-400" />
                        <span className="text-xs font-semibold text-slate-300">{file.date}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {file.content?.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 2).join(' · ') || 'Empty'}
                    </p>
                  </button>
                  {selectedDaily === file.name && (
                    <div className="mt-2 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                      {renderMarkdown(file.content)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
