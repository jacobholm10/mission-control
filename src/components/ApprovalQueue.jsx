import { ShieldAlert, GitBranch, Trash2, Rocket, Check, X } from 'lucide-react';

const actionIcons = {
  git_push: GitBranch,
  delete_file: Trash2,
  deploy: Rocket,
};

const riskColors = {
  low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
};

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export default function ApprovalQueue({ approvals, approveAction, rejectAction }) {
  if (approvals.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <ShieldAlert size={16} className="text-emerald-400" />
          Approval Queue
        </h2>
        <div className="text-center py-8 text-slate-600 text-xs">
          No pending approvals — all clear ✓
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
        <ShieldAlert size={16} className="text-red-400" />
        Approval Queue
        <span className="bg-red-500/20 text-red-400 text-[10px] font-mono px-1.5 py-0.5 rounded-full">{approvals.length}</span>
      </h2>
      <div className="flex flex-col gap-3">
        {approvals.map(approval => {
          const Icon = actionIcons[approval.action] || ShieldAlert;
          const risk = riskColors[approval.risk];
          return (
            <div key={approval.id} className={`bg-slate-800/50 border ${risk.border} rounded-lg p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${risk.bg} flex items-center justify-center`}>
                    <Icon size={16} className={risk.text} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-300">{approval.action.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{approval.id} · {timeAgo(approval.timestamp)}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
                  {approval.risk} risk
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{approval.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => approveAction(approval.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded-md transition-colors cursor-pointer"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  onClick={() => rejectAction(approval.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs rounded-md transition-colors cursor-pointer"
                >
                  <X size={12} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
