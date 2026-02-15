import { Bot } from 'lucide-react';

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'text-slate-400', dotColor: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'text-cyan-400', dotColor: 'bg-cyan-400' },
  { id: 'done', title: 'Done', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
];

const agentColors = {
  Claude: 'bg-cyan-500',
  Opus: 'bg-violet-500',
  Sonnet: 'bg-amber-500',
  Haiku: 'bg-emerald-500',
};

function TaskCard({ task }) {
  const progressColor = task.progress === 100 ? 'bg-emerald-500' : task.progress > 50 ? 'bg-cyan-500' : 'bg-amber-500';

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-slate-500">{task.id}</span>
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full ${agentColors[task.agent] || 'bg-slate-600'} flex items-center justify-center`}>
            <Bot size={10} className="text-white" />
          </div>
          <span className="text-[10px] text-slate-500">{task.agent}</span>
        </div>
      </div>
      <p className="text-xs text-slate-300 mb-3">{task.title}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${progressColor} rounded-full transition-all duration-500`} style={{ width: `${task.progress}%` }} />
        </div>
        <span className="text-[10px] font-mono text-slate-500">{task.progress}%</span>
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks }) {
  return (
    <div className="flex-1 p-4 overflow-auto">
      <h2 className="text-sm font-semibold text-slate-300 mb-4">Task Board</h2>
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span className={`text-xs font-semibold ${col.color}`}>{col.title}</span>
                <span className="text-[10px] text-slate-600 font-mono">{colTasks.length}</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {colTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
