import { useState, useEffect } from 'react';
import { Bot, Clock, Cpu, RefreshCw, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://134.199.194.19:3001';

const mockAgents = [
  { id: 'mock-session-1', model: 'claude-opus-4', status: 'completed', inputTokens: 45000, outputTokens: 12000, size: 234567, modified: new Date().toISOString() },
  { id: 'mock-session-2', model: 'claude-sonnet-4', status: 'completed', inputTokens: 23000, outputTokens: 8000, size: 123456, modified: new Date(Date.now() - 3600000).toISOString() },
];

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(first, last) {
  if (!first || !last) return '—';
  const ms = new Date(last) - new Date(first);
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

function shortModel(model) {
  if (!model) return 'unknown';
  return model.replace('anthropic/', '').replace('claude-', '').split('-').slice(0, 2).join('-');
}

export default function ActiveAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = () => {
    setLoading(true);
    fetch(`${API_URL}/api/agents`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAgents(d); else setAgents(mockAgents); })
      .catch(() => setAgents(mockAgents))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAgents(); }, []);

  const activeCount = agents.filter(a => a.status === 'active').length;
  const totalTokens = agents.reduce((s, a) => s + (a.inputTokens || 0) + (a.outputTokens || 0), 0);

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Bot size={16} className="text-cyan-400" /> Agent Sessions
          </h2>
          <span className="text-[10px] font-mono text-slate-600">{agents.length} sessions · {activeCount} active · {totalTokens.toLocaleString()} tokens</span>
        </div>
        <button onClick={fetchAgents} className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map(agent => {
          const cost = ((agent.inputTokens / 1e6) * 3 + (agent.outputTokens / 1e6) * 15).toFixed(4);
          return (
            <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${agent.status === 'active' ? 'bg-emerald-500/20' : 'bg-slate-700/50'}`}>
                    <Bot size={16} className={agent.status === 'active' ? 'text-emerald-400' : 'text-slate-500'} />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-slate-300 truncate max-w-[180px]">{agent.id.slice(0, 24)}</div>
                    <div className="text-[10px] text-slate-600">{shortModel(agent.model)}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  agent.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <Cpu size={10} />
                  <span>{(agent.inputTokens + agent.outputTokens).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Activity size={10} />
                  <span>${cost}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock size={10} />
                  <span>{formatDuration(agent.firstTimestamp, agent.lastTimestamp)}</span>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-600 font-mono">
                {formatSize(agent.size)} · {new Date(agent.modified).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {agents.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-600 text-xs">No agent sessions found</div>
      )}
    </div>
  );
}
