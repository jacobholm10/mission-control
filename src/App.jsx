import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import FileExplorer from './components/FileExplorer';
import ThoughtStream from './components/ThoughtStream';
import { useAgentState } from './hooks/useAgentState';

function PlaceholderTab({ title }) {
  return (
    <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
      <div className="text-center">
        <div className="text-2xl mb-2">🚧</div>
        <div>{title} — Coming Soon</div>
      </div>
    </div>
  );
}

export default function App() {
  const state = useAgentState();

  const renderContent = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return <Dashboard tasks={state.tasks} approvals={state.approvals} approveAction={state.approveAction} rejectAction={state.rejectAction} telemetry={state.telemetry} latencyData={state.latencyData} />;
      case 'workspace':
        return <FileExplorer fileSystem={state.fileSystem} selectedFile={state.selectedFile} setSelectedFile={state.setSelectedFile} />;
      case 'agents':
        return <PlaceholderTab title="Active Agents" />;
      case 'memory':
        return <PlaceholderTab title="Memory Graph" />;
      case 'settings':
        return <PlaceholderTab title="Settings" />;
      default:
        return <Dashboard tasks={state.tasks} approvals={state.approvals} approveAction={state.approveAction} rejectAction={state.rejectAction} telemetry={state.telemetry} latencyData={state.latencyData} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar activeTab={state.activeTab} setActiveTab={state.setActiveTab} systemStatus={state.systemStatus} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar telemetry={state.telemetry} latencyData={state.latencyData} />
        {renderContent()}
        <ThoughtStream logs={state.logs} isOpen={state.terminalOpen} setIsOpen={state.setTerminalOpen} />
      </div>
    </div>
  );
}
