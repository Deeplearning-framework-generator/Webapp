/**
 * Projects page, URL: "/projects"
 * Rendered inside AppLayout's <Outlet />.
 * Placeholder for now; the real content comes later.
 */

// ProjectPage.jsx
import { useState } from 'react';
import { Search } from 'lucide-react';

const mockProjects = [
  { name: 'CIFAR-10 Classifier', modality: 'Image', lastRun: 'skip-v2', status: 'Training', bestResult: 'val/acc 74.1%', updated: '2 min ago' },
  { name: 'Speech Commands', modality: 'Audio', lastRun: 'baseline', status: 'Waiting for Colab', bestResult: 'None yet', updated: 'Today' },
  { name: 'ViT Flowers', modality: 'Image', lastRun: 'baseline', status: 'Failed', bestResult: 'None yet', updated: 'Yesterday' },
  { name: 'Sentiment Transformer', modality: 'Text', lastRun: 'None', status: 'Not run yet', bestResult: 'None yet', updated: '3 days ago' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    'Training': 'bg-blue-50 text-blue-700',
    'Waiting for Colab': 'bg-orange-50 text-orange-700',
    'Failed': 'bg-red-50 text-red-700',
    'Not run yet': 'bg-gray-100 text-gray-600',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles['Not run yet']}`}>{status}</span>;
};

export default function ProjectPage() {
  const [modality, setModality] = useState('All');
  const [search, setSearch] = useState('');

  const filteredProjects = mockProjects.filter((p) => {
    const matchModality = modality === 'All' || p.modality === modality;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchModality && matchSearch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[26px] font-semibold">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Each project is one trainer. Its runs and files are saved inside it.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium">
          + New project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white">
          <span className="text-sm text-gray-600 whitespace-nowrap">Modality</span>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value)}
            className="text-sm bg-transparent text-gray-600 focus:outline-none cursor-pointer"
          >
            <option>All</option>
            <option>Image</option>
            <option>Audio</option>
            <option>Text</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Modality</th>
              <th className="px-6 py-3">Last run</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Best result</th>
              <th className="px-6 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-gray-600">{p.modality}</td>
                  <td className="px-6 py-4 text-gray-600">{p.lastRun}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-6 py-4 text-gray-600">{p.bestResult}</td>
                  <td className="px-6 py-4 text-gray-500">{p.updated}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                  No projects match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Start a new project */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Start a new project</h2>
          <p className="text-sm text-gray-500 mt-1">Give it a name and an empty trainer canvas opens. Start with a data block and end with a loss block.</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder="e.g. Audio Classifier" 
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md text-sm font-medium">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
