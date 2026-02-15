import { useState, useEffect, useCallback, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://134.199.194.19:3001';
const WS_URL = API_URL.replace(/^http/, 'ws');

const mockTasks = [
  { id: 'TSK-001', title: 'Set up Vite + React project', progress: 100, status: 'done', agent: 'Claude' },
  { id: 'TSK-002', title: 'Build Sidebar navigation', progress: 85, status: 'in-progress', agent: 'Claude' },
  { id: 'TSK-003', title: 'Build Approval Queue', progress: 0, status: 'backlog', agent: 'Sonnet' },
];

const mockApprovals = [
  { id: 'APR-001', action: 'git_push', description: 'Push 3 commits to main branch', risk: 'medium', timestamp: Date.now() - 120000 },
];

export function useAgentState() {
  const [systemStatus, setSystemStatus] = useState('RUNNING');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [tasks, setTasks] = useState(mockTasks);
  const [approvals, setApprovals] = useState(mockApprovals);
  const [logs, setLogs] = useState([]);
  const [latencyData, setLatencyData] = useState(() => Array.from({ length: 30 }, (_, i) => ({ time: i, latency: Math.floor(Math.random() * 150) + 50 })));
  const [telemetry, setTelemetry] = useState({ inputTokens: 0, outputTokens: 0, sessionCost: 0, contextUsage: 0 });
  const [terminalOpen, setTerminalOpen] = useState(true);
  const apiOk = useRef(false);

  // Fetch status
  useEffect(() => {
    const poll = () => fetch(`${API_URL}/api/status`).then(r => r.json()).then(d => {
      apiOk.current = true;
      setSystemStatus(d.status || 'RUNNING');
    }).catch(() => { if (!apiOk.current) setSystemStatus('RUNNING'); });
    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, []);

  // Fetch telemetry
  useEffect(() => {
    const poll = () => fetch(`${API_URL}/api/telemetry`).then(r => r.json()).then(d => {
      setTelemetry(prev => ({ ...prev, ...d }));
    }).catch(() => {});
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  // Fetch tasks
  useEffect(() => {
    fetch(`${API_URL}/api/tasks`).then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length) setTasks(d);
    }).catch(() => {});
  }, []);

  // WebSocket: logs
  useEffect(() => {
    let ws, reconnect;
    const connect = () => {
      try {
        ws = new WebSocket(`${WS_URL}/ws/logs`);
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            setLogs(prev => [...prev.slice(-100), msg]);
          } catch {}
        };
        ws.onclose = () => { reconnect = setTimeout(connect, 5000); };
      } catch {}
    };
    connect();
    return () => { clearTimeout(reconnect); ws?.close(); };
  }, []);

  // WebSocket: file changes (kept for potential future use)
  useEffect(() => {
    let ws, reconnect;
    const connect = () => {
      try {
        ws = new WebSocket(`${WS_URL}/ws/files`);
        ws.onclose = () => { reconnect = setTimeout(connect, 5000); };
      } catch {}
    };
    connect();
    return () => { clearTimeout(reconnect); ws?.close(); };
  }, []);

  // Simulated latency data rotation
  useEffect(() => {
    const id = setInterval(() => {
      setLatencyData(prev => [...prev.slice(1), { time: prev[prev.length - 1].time + 1, latency: Math.floor(Math.random() * 150) + 50 }]);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Fallback: simulated logs if WS not connected
  useEffect(() => {
    const msgs = [
      { type: 'info', message: 'Analyzing file structure...' },
      { type: 'success', message: 'Component compiled successfully' },
      { type: 'warning', message: 'Context window at 73% capacity' },
    ];
    const id = setInterval(() => {
      if (!apiOk.current) {
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        setLogs(prev => [...prev.slice(-100), { ...msg, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) }]);
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const approveAction = useCallback((id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setLogs(prev => [...prev, { type: 'success', message: `Approved action ${id}`, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) }]);
  }, []);

  const rejectAction = useCallback((id) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    setLogs(prev => [...prev, { type: 'warning', message: `Rejected action ${id}`, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) }]);
  }, []);

  useEffect(() => {
    if (approvals.length > 0) setSystemStatus(prev => prev === 'STOPPED' ? prev : 'AWAITING_APPROVAL');
  }, [approvals.length]);

  return {
    systemStatus, setSystemStatus,
    activeTab, setActiveTab,
    selectedFile, setSelectedFile,
    tasks, setTasks,
    approvals, approveAction, rejectAction,
    logs, latencyData, telemetry,
    terminalOpen, setTerminalOpen,
  };
}
