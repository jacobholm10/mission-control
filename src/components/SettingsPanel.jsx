import { useState, useEffect } from 'react';
import { Settings, Monitor, Clock, Palette, Terminal, Globe, Server, Bot } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://134.199.194.19:3001';

function SettingToggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
      <div>
        <div className="text-xs text-slate-300">{label}</div>
        {desc && <div className="text-[10px] text-slate-600 mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center px-0.5 ${value ? 'bg-cyan-500' : 'bg-slate-700'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function SettingSelect({ label, desc, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50">
      <div>
        <div className="text-xs text-slate-300">{label}</div>
        {desc && <div className="text-[10px] text-slate-600 mt-0.5">{desc}</div>}
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-md px-2 py-1 outline-none focus:border-cyan-500"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('mc-settings') || '{}'); } catch { return {}; }
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState(() => ({
    autoRefresh: true,
    refreshInterval: '5000',
    terminalAutoOpen: true,
    theme: 'dark',
    ...loadSettings(),
  }));

  useEffect(() => {
    localStorage.setItem('mc-settings', JSON.stringify(settings));
  }, [settings]);

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-6">
          <Settings size={16} className="text-slate-400" /> Settings
        </h2>

        {/* Server Config */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Server size={12} /> Server Configuration
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">API URL</span>
              <span className="text-xs font-mono text-slate-300">{API_URL}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">WebSocket URL</span>
              <span className="text-xs font-mono text-slate-300">{API_URL.replace(/^http/, 'ws')}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Server Port</span>
              <span className="text-xs font-mono text-slate-300">3001</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Watched Directory</span>
              <span className="text-xs font-mono text-slate-300">/root/fb-mvp</span>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Bot size={12} /> OpenClaw Agent
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Model</span>
              <span className="text-xs font-mono text-cyan-400">claude-opus-4</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Sessions Directory</span>
              <span className="text-xs font-mono text-slate-300">/home/openclaw/.openclaw/agents/main/sessions/</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-500">Workspace</span>
              <span className="text-xs font-mono text-slate-300">/home/openclaw/.openclaw/workspace/</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Monitor size={12} /> Preferences
          </h3>
          <SettingToggle label="Auto-refresh" desc="Automatically poll API for updates" value={settings.autoRefresh} onChange={v => update('autoRefresh', v)} />
          <SettingSelect label="Refresh Interval" desc="How often to poll for new data" value={settings.refreshInterval} onChange={v => update('refreshInterval', v)} options={[
            { value: '2000', label: '2s' }, { value: '5000', label: '5s' }, { value: '10000', label: '10s' }, { value: '30000', label: '30s' },
          ]} />
          <SettingToggle label="Terminal Auto-open" desc="Open thought stream on launch" value={settings.terminalAutoOpen} onChange={v => update('terminalAutoOpen', v)} />
          <SettingSelect label="Theme" desc="Dashboard color scheme" value={settings.theme} onChange={v => update('theme', v)} options={[
            { value: 'dark', label: 'Dark (Default)' }, { value: 'midnight', label: 'Midnight' },
          ]} />
        </div>
      </div>
    </div>
  );
}
