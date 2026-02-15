import { Activity, Bot, Cpu, Clock, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from 'recharts';
import KanbanBoard from './KanbanBoard';
import ApprovalQueue from './ApprovalQueue';

function StatCard({ icon: Icon, iconColor, label, value, subValue, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={iconColor} />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
        </div>
      </div>
      <div className="text-xl font-bold text-slate-200 font-mono">{value}</div>
      {subValue && <div className="text-[10px] text-slate-500">{subValue}</div>}
      {children}
    </div>
  );
}

export default function Dashboard({ tasks, approvals, approveAction, rejectAction, telemetry, latencyData }) {
  const activeTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="flex-1 overflow-auto p-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatCard icon={Bot} iconColor="text-cyan-400" label="Active Agents" value="3" subValue="Claude, Opus, Sonnet" />
        <StatCard icon={Activity} iconColor="text-emerald-400" label="Tasks Running" value={activeTasks} subValue={`${completedTasks} completed`}>
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData.slice(-15)}>
                <Area type="monotone" dataKey="latency" stroke="#10b981" fill="#10b98120" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </StatCard>
        <StatCard icon={Cpu} iconColor="text-violet-400" label="Token Burn" value={`${(telemetry.inputTokens + telemetry.outputTokens).toLocaleString()}`} subValue={`$${telemetry.sessionCost.toFixed(4)} this session`} />
        <StatCard icon={Zap} iconColor="text-amber-400" label="Avg Latency" value={`${Math.round(latencyData.reduce((a, b) => a + b.latency, 0) / latencyData.length)}ms`} subValue="Last 30 requests">
          <div className="h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <Line type="monotone" dataKey="latency" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </StatCard>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Kanban takes 2 cols */}
        <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <KanbanBoard tasks={tasks} />
        </div>

        {/* Approval Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <ApprovalQueue approvals={approvals} approveAction={approveAction} rejectAction={rejectAction} />
        </div>
      </div>
    </div>
  );
}
