import { useState } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';

function FileTreeNode({ node, depth = 0, selectedFile, setSelectedFile, path = '' }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const currentPath = path ? `${path}/${node.name}` : node.name;
  const isFolder = node.type === 'folder';
  const isSelected = selectedFile === currentPath;

  const statusDot = node.status === 'created'
    ? <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
    : node.status === 'modified'
    ? <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
    : null;

  return (
    <div>
      <button
        onClick={() => {
          if (isFolder) setExpanded(!expanded);
          else setSelectedFile(currentPath);
        }}
        className={`w-full flex items-center gap-1.5 py-1 px-2 text-xs hover:bg-slate-800/50 transition-colors cursor-pointer ${
          isSelected ? 'bg-slate-800 text-cyan-400' : 'text-slate-400'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            {expanded ? <FolderOpen size={14} className="text-cyan-400" /> : <Folder size={14} className="text-cyan-400" />}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File size={14} className="text-slate-500" />
          </>
        )}
        <span className="truncate flex-1 text-left">{node.name}</span>
        {statusDot}
      </button>
      {isFolder && expanded && node.children?.map((child, i) => (
        <FileTreeNode key={i} node={child} depth={depth + 1} selectedFile={selectedFile} setSelectedFile={setSelectedFile} path={currentPath} />
      ))}
    </div>
  );
}

function Breadcrumbs({ path }) {
  if (!path) return null;
  const parts = path.split('/');
  return (
    <div className="flex items-center gap-1 px-4 py-2 text-xs text-slate-500 border-b border-slate-800 bg-slate-900/50">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={10} />}
          <span className={i === parts.length - 1 ? 'text-slate-300' : ''}>{p}</span>
        </span>
      ))}
    </div>
  );
}

function CodeEditor({ filePath }) {
  const mockCode = `// ${filePath}
import { useState, useEffect } from 'react';

/**
 * Auto-generated component
 * Last modified: ${new Date().toISOString()}
 */
export default function Component() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Initialize component
    console.log('Component mounted');
    return () => console.log('Component unmounted');
  }, []);

  return (
    <div className="p-4">
      <h1>Component View</h1>
      <p>Editing: {filePath}</p>
    </div>
  );
}`;

  return (
    <div className="flex-1 overflow-auto p-4">
      <pre className="text-xs font-mono leading-relaxed">
        {mockCode.split('\n').map((line, i) => (
          <div key={i} className="flex">
            <span className="w-8 text-right pr-4 text-slate-600 select-none">{i + 1}</span>
            <span className="text-slate-300">{line}</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

export default function FileExplorer({ fileSystem, selectedFile, setSelectedFile }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Tree Sidebar */}
      <div className="w-60 bg-slate-900 border-r border-slate-800 overflow-y-auto shrink-0">
        <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Explorer</div>
        <FileTreeNode node={fileSystem} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-slate-950">
        {selectedFile ? (
          <>
            <Breadcrumbs path={selectedFile} />
            <CodeEditor filePath={selectedFile} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            Select a file to view
          </div>
        )}
      </div>
    </div>
  );
}
