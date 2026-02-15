import { useState, useEffect, useCallback } from 'react';
import { Folder, FolderOpen, File, ChevronRight, Home, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://134.199.194.19:3001';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Breadcrumbs({ currentPath, onNavigate }) {
  const parts = currentPath ? currentPath.split('/').filter(Boolean) : [];
  return (
    <div className="flex items-center gap-1 px-4 py-2 text-xs text-slate-500 border-b border-slate-800 bg-slate-900/50 flex-wrap">
      <button onClick={() => onNavigate('')} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1">
        <Home size={12} />
        <span>root</span>
      </button>
      {parts.map((p, i) => {
        const path = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={10} />
            {isLast ? (
              <span className="text-slate-300">{p}</span>
            ) : (
              <button onClick={() => onNavigate(path)} className="hover:text-cyan-400 transition-colors cursor-pointer">{p}</button>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function FileExplorer({ selectedFile, setSelectedFile }) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDir = useCallback((dirPath) => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/files?path=${encodeURIComponent(dirPath)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setItems([]); }
        else {
          const sorted = (d.items || []).sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
          setItems(sorted);
        }
      })
      .catch(() => {
        setError('API unreachable');
        setItems([
          { name: 'mock-file.js', type: 'file', size: 1234, modified: new Date().toISOString(), status: null },
          { name: 'mock-folder', type: 'folder', size: 0, modified: new Date().toISOString(), status: null },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDir(currentPath); }, [currentPath, fetchDir]);

  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedFile(null);
  };

  const handleClick = (item) => {
    if (item.type === 'folder') {
      navigateTo(currentPath ? `${currentPath}/${item.name}` : item.name);
    } else {
      const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
      setSelectedFile(filePath);
    }
  };

  const statusDot = (status) => {
    if (status === 'new') return <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="New" />;
    if (status === 'modified') return <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Modified" />;
    return null;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
      <Breadcrumbs currentPath={currentPath} onNavigate={navigateTo} />

      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          {items.length} items
        </span>
        <button onClick={() => fetchDir(currentPath)} className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer" title="Refresh">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-amber-400 bg-amber-500/10 border-b border-amber-500/20">
          ⚠ {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {currentPath && (
          <button
            onClick={() => {
              const parent = currentPath.split('/').slice(0, -1).join('/');
              navigateTo(parent);
            }}
            className="w-full flex items-center gap-2 py-2 px-4 text-xs text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 transition-colors cursor-pointer border-b border-slate-800/30"
          >
            <Folder size={14} className="text-slate-600" />
            <span>..</span>
          </button>
        )}

        {items.map((item) => {
          const filePath = currentPath ? `${currentPath}/${item.name}` : item.name;
          const isSelected = selectedFile === filePath;
          return (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center gap-2 py-2 px-4 text-xs hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-800/10 ${
                isSelected ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
              }`}
            >
              {item.type === 'folder' ? (
                <FolderOpen size={14} className="text-cyan-400 shrink-0" />
              ) : (
                <File size={14} className="text-slate-500 shrink-0" />
              )}
              <span className="truncate flex-1 text-left">{item.name}</span>
              {statusDot(item.status)}
              <span className="text-[10px] text-slate-600 font-mono shrink-0">
                {item.type === 'file' ? formatSize(item.size) : ''}
              </span>
              <span className="text-[10px] text-slate-600 shrink-0 w-16 text-right">
                {formatDate(item.modified)}
              </span>
            </button>
          );
        })}

        {items.length === 0 && !loading && !error && (
          <div className="flex items-center justify-center py-12 text-slate-600 text-xs">Empty directory</div>
        )}
      </div>
    </div>
  );
}
