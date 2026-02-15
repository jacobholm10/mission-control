import { LayoutDashboard, FolderTree, Bot, BrainCircuit, Settings, Circle } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'workspace', icon: FolderTree, label: 'Workspace' },
  { id: 'agents', icon: Bot, label: 'Agents' },
  { id: 'memory', icon: BrainCircuit, label: 'Memory' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

const statusColors = {
  IDLE: 'text-slate-400',
  RUNNING: 'text-emerald-400',
  PAUSED: 'text-amber-400',
  AWAITING_APPROVAL: 'text-red-400',
};

const statusBg = {
  IDLE: 'bg-slate-400/10',
  RUNNING: 'bg-emerald-400/10',
  PAUSED: 'bg-amber-400/10',
  AWAITING_APPROVAL: 'bg-red-400/10',
};

export default function Sidebar({ activeTab, setActiveTab, systemStatus }) {
  return (
    <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-2 shrink-0">
      {/* Logo */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center mb-4 font-bold text-sm text-white">
        MC
      </div>

      {/* Nav Items */}
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          title={label}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
            activeTab === id
              ? 'bg-slate-800 text-cyan-400'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
          }`}
        >
          <Icon size={20} />
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status Badge */}
      <div className={`px-1.5 py-1 rounded-md ${statusBg[systemStatus]} flex flex-col items-center gap-1`}>
        <Circle size={8} className={`${statusColors[systemStatus]} fill-current`} />
        <span className={`text-[8px] font-mono font-bold ${statusColors[systemStatus]} leading-none text-center`}>
          {systemStatus === 'AWAITING_APPROVAL' ? 'AWAIT' : systemStatus}
        </span>
      </div>
    </div>
  );
}
