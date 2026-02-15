import { useState, useEffect, useCallback } from 'react';

const mockFileSystem = {
  name: 'mission-control',
  type: 'folder',
  children: [
    {
      name: 'src', type: 'folder', children: [
        { name: 'App.jsx', type: 'file', status: 'created', language: 'jsx' },
        { name: 'main.jsx', type: 'file', status: null, language: 'jsx' },
        { name: 'index.css', type: 'file', status: 'modified', language: 'css' },
        {
          name: 'components', type: 'folder', children: [
            { name: 'Sidebar.jsx', type: 'file', status: 'created', language: 'jsx' },
            { name: 'TopBar.jsx', type: 'file', status: 'modified', language: 'jsx' },
            { name: 'FileExplorer.jsx', type: 'file', status: 'created', language: 'jsx' },
            { name: 'KanbanBoard.jsx', type: 'file', status: null, language: 'jsx' },
            { name: 'ApprovalQueue.jsx', type: 'file', status: 'created', language: 'jsx' },
            { name: 'ThoughtStream.jsx', type: 'file', status: null, language: 'jsx' },
          ]
        },
        {
          name: 'hooks', type: 'folder', children: [
            { name: 'useAgentState.js', type: 'file', status: 'modified', language: 'js' },
          ]
        },
      ]
    },
    {
      name: 'public', type: 'folder', children: [
        { name: 'vite.svg', type: 'file', status: null, language: 'svg' },
      ]
    },
    { name: 'package.json', type: 'file', status: 'modified', language: 'json' },
    { name: 'vite.config.js', type: 'file', status: null, language: 'js' },
    { name: 'README.md', type: 'file', status: null, language: 'md' },
    { name: '.gitignore', type: 'file', status: null, language: 'text' },
  ]
};

const initialTasks = [
  { id: 'TSK-001', title: 'Set up Vite + React project', progress: 100, status: 'done', agent: 'Claude' },
  { id: 'TSK-002', title: 'Install Tailwind CSS', progress: 100, status: 'done', agent: 'Claude' },
  { id: 'TSK-003', title: 'Build Sidebar navigation', progress: 85, status: 'in-progress', agent: 'Claude' },
  { id: 'TSK-004', title: 'Implement File Explorer', progress: 60, status: 'in-progress', agent: 'Claude' },
  { id: 'TSK-005', title: 'Create Kanban Board', progress: 30, status: 'in-progress', agent: 'Opus' },
  { id: 'TSK-006', title: 'Build Approval Queue', progress: 0, status: 'backlog', agent: 'Sonnet' },
  { id: 'TSK-007', title: 'Add Thought Stream terminal', progress: 0, status: 'backlog', agent: 'Claude' },
  { id: 'TSK-008', title: 'Deploy to production', progress: 0, status: 'backlog', agent: 'Haiku' },
];

const logTypes = ['info', 'warning', 'error', 'success'];
const logMessages = [
  { type: 'info', message: 'Analyzing file structure...' },
  { type: 'info', message: 'Reading workspace context from AGENTS.md' },
  { type: 'success', message: 'Component compiled successfully' },
  { type: 'info', message: 'Resolving dependencies...' },
  { type: 'warning', message: 'Context window at 73% capacity' },
  { type: 'info', message: 'Generating TypeScript definitions...' },
  { type: 'success', message: 'Build completed in 1.2s' },
  { type: 'error', message: 'Failed to connect to remote VPS (retrying...)' },
  { type: 'info', message: 'Tokenizing input: 2,847 tokens' },
  { type: 'warning', message: 'Rate limit approaching: 42/50 requests' },
  { type: 'success', message: 'File saved: src/components/Sidebar.jsx' },
  { type: 'info', message: 'Running ESLint checks...' },
  { type: 'success', message: 'All checks passed ✓' },
  { type: 'info', message: 'Streaming response chunk 3/7...' },
  { type: 'warning', message: 'Memory pressure: consider summarizing context' },
  { type: 'error', message: 'API timeout after 30000ms' },
  { type: 'info', message: 'Tool call: read_file("src/App.jsx")' },
  { type: 'success', message: 'Git commit: feat(dashboard): add telemetry bar' },
];

const pendingApprovals = [
  { id: 'APR-001', action: 'git_push', description: 'Push 3 commits to main branch', risk: 'medium', timestamp: Date.now() - 120000 },
  { id: 'APR-002', action: 'delete_file', description: 'Remove deprecated config.legacy.js', risk: 'low', timestamp: Date.now() - 60000 },
  { id: 'APR-003', action: 'deploy', description: 'Deploy v2.1.0 to production', risk: 'high', timestamp: Date.now() - 30000 },
];

function generateLatencyData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({ time: i, latency: Math.floor(Math.random() * 150) + 50 });
  }
  return data;
}

export function useAgentState() {
  const [systemStatus, setSystemStatus] = useState('RUNNING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fileSystem, setFileSystem] = useState(mockFileSystem);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [logs, setLogs] = useState([]);
  const [latencyData, setLatencyData] = useState(generateLatencyData());
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [telemetry, setTelemetry] = useState({
    inputTokens: 12847,
    outputTokens: 8432,
    sessionCost: 0.47,
    contextUsage: 68,
  });

  // Simulate log streaming
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [...prev.slice(-100), {
        ...msg,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).slice(2),
      }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        inputTokens: prev.inputTokens + Math.floor(Math.random() * 200),
        outputTokens: prev.outputTokens + Math.floor(Math.random() * 150),
        sessionCost: +(prev.sessionCost + Math.random() * 0.02).toFixed(4),
        contextUsage: Math.min(95, prev.contextUsage + (Math.random() > 0.7 ? 1 : -0.5)),
      }));
      setLatencyData(prev => {
        const next = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, latency: Math.floor(Math.random() * 150) + 50 }];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate file modifications
  useEffect(() => {
    const interval = setInterval(() => {
      setFileSystem(prev => {
        const clone = JSON.parse(JSON.stringify(prev));
        const toggleRandom = (node) => {
          if (node.type === 'file' && Math.random() > 0.85) {
            node.status = node.status === 'modified' ? 'created' : Math.random() > 0.5 ? 'modified' : null;
          }
          if (node.children) node.children.forEach(toggleRandom);
        };
        toggleRandom(clone);
        return clone;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const approveAction = useCallback((id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setLogs(prev => [...prev, { type: 'success', message: `Approved action ${id}`, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) }]);
    if (approvals.length <= 1) setSystemStatus('RUNNING');
  }, [approvals.length]);

  const rejectAction = useCallback((id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setLogs(prev => [...prev, { type: 'warning', message: `Rejected action ${id}`, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) }]);
    if (approvals.length <= 1) setSystemStatus('RUNNING');
  }, [approvals.length]);

  useEffect(() => {
    if (approvals.length > 0) setSystemStatus('AWAITING_APPROVAL');
  }, [approvals.length]);

  return {
    systemStatus, setSystemStatus,
    activeTab, setActiveTab,
    fileSystem, selectedFile, setSelectedFile,
    tasks, setTasks,
    approvals, approveAction, rejectAction,
    logs, latencyData, telemetry,
    terminalOpen, setTerminalOpen,
  };
}
