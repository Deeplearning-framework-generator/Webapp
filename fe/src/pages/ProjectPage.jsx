/**
 * Projects page, URL: "/projects"
 * Rendered inside AppLayout's <Outlet />.
 * Placeholder for now; the real content comes later.
 */

// ProjectPage.jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ProjectModel {
  constructor({ id, name, modality, lastRun, status, bestResult, updated }) {
    this.id = id || 'unknown-id';
    this.name = name || 'Unnamed Project';
    this.modality = modality || 'Unknown';
    this.lastRun = lastRun || 'None';
    this.status = status || 'Not run yet';
    this.bestResult = bestResult || 'None yet';
    this.updated = updated || 'Just now';
  }
}

const mockProjects = [
  new ProjectModel({}),
  new ProjectModel({ id: 'cifar-10-classifier', name: 'CIFAR-10 Classifier', modality: 'Image', lastRun: 'skip-v2', status: 'Training', bestResult: 'val/acc 74.1%', updated: '2 min ago' }),
  new ProjectModel({ id: 'speech-commands', name: 'Speech Commands', modality: 'Audio', lastRun: 'baseline', status: 'Waiting for Colab', bestResult: 'None yet', updated: 'Today' }),
  new ProjectModel({ id: 'vit-flowers', name: 'ViT Flowers', modality: 'Image', lastRun: 'baseline', status: 'Failed', bestResult: 'None yet', updated: 'Yesterday' }),
  new ProjectModel({ id: 'sentiment-transformer', name: 'Sentiment Transformer', modality: 'Text', lastRun: 'None', status: 'Not run yet', bestResult: 'None yet', updated: '3 days ago' }),
];

const StatusBadge = ({ status }) => {
  const styles = {
    'Training': {
      bg: 'bg-blue-500/10 text-blue-400',
      dot: 'bg-blue-400',
    },
    'Waiting for Colab': {
      bg: 'bg-orange-500/10 text-orange-400',
      dot: 'bg-orange-400',
    },
    'Failed': {
      bg: 'bg-red-500/10 text-red-400',
      dot: 'bg-red-400',
    },
    'Not run yet': {
      bg: 'bg-surface-soft text-muted',
      dot: 'bg-muted',
    },
  };

  const currentStyle = styles[status] || styles['Not run yet'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${currentStyle.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${currentStyle.dot}`} />
      {status}
    </span>
  );
};

export default function ProjectPage() {
  const [modality, setModality] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredProjects = mockProjects.filter((p) => {
    const matchModality = modality === 'All' || p.modality === modality;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchModality && matchSearch;
  });

  const handleProjectClick = (projectId) => {
    const project = mockProjects.find((p) => p.id === projectId);
    navigate(`/projects/${projectId}`, { state: { project } });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-ink">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[26px] font-semibold text-ink">Projects</h1>
          <p className="text-sm text-muted mt-1">Each project is one trainer. Its runs and files are saved inside it.</p>
        </div>
        <button className="bg-accent hover:opacity-90 text-white px-4 py-2 rounded-md text-sm font-medium">
          + New project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-line bg-surface text-ink rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="flex items-center gap-2 border border-line rounded-md px-3 py-2 bg-surface">
          <span className="text-sm text-muted whitespace-nowrap">Modality</span>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="text-sm bg-transparent text-ink focus:outline-none cursor-pointer"
          >
            <option className="bg-surface text-ink">All</option>
            <option className="bg-surface text-ink">Image</option>
            <option className="bg-surface text-ink">Audio</option>
            <option className="bg-surface text-ink">Text</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-lg overflow-hidden mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-soft text-muted font-medium border-b border-line">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Modality</th>
              <th className="px-6 py-3">Last run</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Best result</th>
              <th className="px-6 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p, idx) => (
                <tr key={idx} className="hover:bg-hover cursor-pointer" onClick={() => handleProjectClick(p.id)}>
                  <td className="px-6 py-4 font-medium text-ink">{p.name}</td>
                  <td className="px-6 py-4 text-muted">{p.modality}</td>
                  <td className="px-6 py-4 text-muted">{p.lastRun}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-muted">{p.bestResult}</td>
                  <td className="px-6 py-4 text-muted">{p.updated}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted">
                  No projects match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Start a new project */}
      <div className="bg-surface border border-line rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-ink">Start a new project</h2>
          <p className="text-sm text-muted mt-1">Give it a name and an empty trainer canvas opens. Start with a data block and end with a loss block.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="e.g. Audio Classifier" 
            className="border border-line bg-surface text-ink rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button className="bg-accent hover:opacity-90 text-white px-5 py-2 rounded-md text-sm font-medium">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}