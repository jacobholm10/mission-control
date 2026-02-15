import { Activity, DollarSign, Cpu, Zap } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function TopBar({ telemetry, latencyData }) {
  const { inputTokens, outputTokens, sessionCost, contextUsage } = telemetry;

  const contextColor = contextUsage > 80 ? 'bg-red-500' : contextUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-6 shrink-0 overflow-x-auto">
      {/* Token Usage */}
      <div className="flex items-center gap-2 text-xs">
        <Activity size={14} className="text-cyan-400" />
        <span className="text-slate-500">Tokens</span>
        <span className="text-slate-300 font-mono">{inputTokens.toLocaleString()}</span>
        <span className="text-slate-600">/</span>
        <span className="text-emerald-400 font-mono">{outputTokens.toLocaleString()}</span>
      </div>

      <div className="w-px h-6 bg-slate-800" />

      {/* Session Cost */}
      <div className="flex items-center gap-2 text-xs">
        <DollarSign size={14} className="text-amber-400" />
        <span className="text-slate-500">Cost</span>
        <span className="text-amber-400 font-mono">${sessionCost.toFixed(4)}</span>
      </div>

      <div className="w-px h-6 bg-slate-800" />

      {/* Context Window */}
      <div className="flex items-center gap-2 text-xs min-w-[180px]">
        <Cpu size={14} className="text-violet-400" />
        <span className="text-slate-500">Context</span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full ${contextColor} rounded-full transition-all duration-500`} style={{ width: `${contextUsage}%` }} />
        </div>
        <span className="text-slate-400 font-mono">{Math.round(contextUsage)}%</span>
      </div>

      <div className="w-px h-6 bg-slate-800" />

      {/* Latency Sparkline */}
      <div className="flex items-center gap-2 text-xs">
        <Zap size={14} className="text-cyan-400" />
        <span className="text-slate-500">Latency</span>
        <div className="w-24 h-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyData}>
              <YAxis domain={[0, 250]} hide />
              <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <span className="text-slate-400 font-mono">{latencyData[latencyData.length - 1]?.latency}ms</span>
      </div>
    </div>
  );
}
