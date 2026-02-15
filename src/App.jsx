import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import FileExplorer from './components/FileExplorer';
import ThoughtStream from './components/ThoughtStream';
import ActiveAgents from './components/ActiveAgents';
import MemoryGraph from './components/MemoryGraph';
import SettingsPanel from './components/SettingsPanel';
import { useAgentState } from './hooks/useAgentState';

export default function App() {
  const state = useAgentState();

  const renderContent = () => {
    switch (state.activeTab) {
      case 'dashboard':
        return <Dashboard tasks={state.tasks} approvals={state.approvals} approveAction={state.approveAction} rejectAction={state.rejectAction} telemetry={state.telemetry} latencyData={state.latencyData} />;
      case 'workspace':
        return <FileExplorer selectedFile={state.selectedFile} setSelectedFile={state.setSelectedFile} />;
      case 'agents':
        return <ActiveAgents />;
      case 'memory':
        return <MemoryGraph />;
      case 'settings':
        return <SettingsPanel />;
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
