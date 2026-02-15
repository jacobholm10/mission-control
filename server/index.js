const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const app = express();
const server = http.createServer(app);
const PORT = 3001;

const SESSIONS_DIR = '/home/openclaw/.openclaw/agents/main/sessions';
const FB_MVP_DIR = '/root/fb-mvp';
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');

app.use(cors());
app.use(express.json());

// ─── Helpers ───

function getLatestSession() {
  try {
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.includes('deleted'))
      .map(f => ({ name: f, mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    return files[0] ? path.join(SESSIONS_DIR, files[0].name) : null;
  } catch { return null; }
}

function parseTelemetry(sessionPath) {
  let inputTokens = 0, outputTokens = 0;
  try {
    const lines = fs.readFileSync(sessionPath, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.usage) {
          inputTokens += obj.usage.input_tokens || 0;
          outputTokens += obj.usage.output_tokens || 0;
        }
        if (obj.message?.usage) {
          inputTokens += obj.message.usage.input_tokens || 0;
          outputTokens += obj.message.usage.output_tokens || 0;
        }
      } catch {}
    }
  } catch {}
  // Opus pricing
  const costInput = (inputTokens / 1_000_000) * 3;
  const costOutput = (outputTokens / 1_000_000) * 15;
  return {
    inputTokens, outputTokens,
    sessionCost: +(costInput + costOutput).toFixed(4),
    contextUsage: Math.min(100, Math.round((inputTokens / 200_000) * 100)),
  };
}

function fileStatus(stat) {
  const now = Date.now();
  const fiveMin = 5 * 60 * 1000;
  const today = new Date().setHours(0, 0, 0, 0);
  if (now - stat.mtimeMs < fiveMin) return 'modified';
  if (stat.birthtimeMs >= today || stat.ctimeMs >= today) return 'new';
  return null;
}

// ─── API: Files ───

app.get('/api/files', (req, res) => {
  const relPath = req.query.path || '';
  const fullPath = path.join(FB_MVP_DIR, relPath);
  try {
    const entries = fs.readdirSync(fullPath);
    const items = entries.map(name => {
      try {
        const stat = fs.statSync(path.join(fullPath, name));
        return {
          name, type: stat.isDirectory() ? 'folder' : 'file',
          size: stat.size, modified: stat.mtime.toISOString(),
          status: fileStatus(stat),
        };
      } catch { return { name, type: 'file', size: 0, modified: null, status: null }; }
    });
    res.json({ path: relPath, items });
  } catch (e) {
    res.status(404).json({ error: 'Path not found', details: e.message });
  }
});

// ─── API: Telemetry ───

app.get('/api/telemetry', (req, res) => {
  const sessionPath = getLatestSession();
  const telemetry = sessionPath ? parseTelemetry(sessionPath) : { inputTokens: 0, outputTokens: 0, sessionCost: 0, contextUsage: 0 };
  telemetry.uptime = os.uptime();
  res.json(telemetry);
});

// ─── API: Status ───

app.get('/api/status', (req, res) => {
  let running = false;
  try {
    execSync('pgrep -f openclaw', { stdio: 'pipe' });
    running = true;
  } catch {}
  res.json({ status: running ? 'RUNNING' : 'STOPPED', running, timestamp: new Date().toISOString() });
});

// ─── API: Tasks ───

function readTasks() {
  try { return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8')); } catch { return []; }
}
function writeTasks(tasks) { fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2)); }

app.get('/api/tasks', (req, res) => res.json(readTasks()));

app.post('/api/tasks', (req, res) => {
  const tasks = readTasks();
  const task = { id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`, progress: 0, status: 'backlog', column: 'backlog', agent: 'Claude', ...req.body };
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  Object.assign(tasks[idx], req.body);
  writeTasks(tasks);
  res.json(tasks[idx]);
});

app.delete('/api/tasks/:id', (req, res) => {
  let tasks = readTasks();
  tasks = tasks.filter(t => t.id !== req.params.id);
  writeTasks(tasks);
  res.json({ ok: true });
});

// ─── WebSocket: Logs ───

const wssLogs = new WebSocket.Server({ noServer: true });
const wssFiles = new WebSocket.Server({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws/logs') wssLogs.handleUpgrade(req, socket, head, ws => wssLogs.emit('connection', ws));
  else if (req.url === '/ws/files') wssFiles.handleUpgrade(req, socket, head, ws => wssFiles.emit('connection', ws));
  else socket.destroy();
});

// Watch latest session log
let logWatcher = null;
function watchLatestLog() {
  if (logWatcher) logWatcher.close();
  const sessionPath = getLatestSession();
  if (!sessionPath) return;
  let fileSize = 0;
  try { fileSize = fs.statSync(sessionPath).size; } catch {}

  logWatcher = chokidar.watch(sessionPath, { persistent: true });
  logWatcher.on('change', () => {
    try {
      const stat = fs.statSync(sessionPath);
      if (stat.size <= fileSize) return;
      const stream = fs.createReadStream(sessionPath, { start: fileSize, encoding: 'utf8' });
      let buf = '';
      stream.on('data', chunk => buf += chunk);
      stream.on('end', () => {
        fileSize = stat.size;
        const lines = buf.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            let type = 'info', message = '';
            if (obj.type === 'assistant') { type = 'info'; message = obj.message?.content?.[0]?.text?.slice(0, 200) || 'assistant message'; }
            else if (obj.type === 'tool_use') { type = 'warning'; message = `Tool: ${obj.name || 'unknown'}`; }
            else if (obj.type === 'tool_result') { type = 'success'; message = 'Tool result received'; }
            else if (obj.type === 'error') { type = 'error'; message = obj.error || 'Error'; }
            else { type = 'info'; message = obj.type || 'event'; }
            const payload = JSON.stringify({ type, message, timestamp: new Date().toISOString(), id: Math.random().toString(36).slice(2) });
            wssLogs.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
          } catch {}
        }
      });
    } catch {}
  });
}
watchLatestLog();
// Re-check for new session files periodically
setInterval(watchLatestLog, 30000);

// Watch fb-mvp for file changes
try {
  const fileWatcher = chokidar.watch(FB_MVP_DIR, { persistent: true, ignoreInitial: true, depth: 3 });
  fileWatcher.on('error', err => console.warn('File watcher error:', err.message));
  fileWatcher.on('all', (event, filePath) => {
    const payload = JSON.stringify({ event, path: filePath.replace(FB_MVP_DIR, ''), timestamp: new Date().toISOString() });
    wssFiles.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
  });
} catch (e) {
  console.warn('Could not watch fb-mvp:', e.message);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mission Control server running on port ${PORT}`);
});
