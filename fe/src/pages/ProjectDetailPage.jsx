import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, Play, Settings, ArrowLeft } from 'lucide-react';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/projects')}
            className="p-1.5 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="w-4 h-4 text-gray-900" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">CIFAR-10 Classifier</h1>
            <p className="text-xs text-gray-500">Saved 1 min ago</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-md p-0.5">
            <button className="px-3 py-1 text-xs font-medium bg-white rounded shadow-sm text-gray-600">Build</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-600">Runs 2</button>
          </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"> Valid, 10 connections</span>
            <button className="px-3 py-1 text-xs border border-gray-200 rounded-md text-gray-600">···</button>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50">
            <Settings className="w-3 h-3" />
            Config
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
            <Play className="w-3 h-3" />
            Run
            </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 bg-gray-50 relative">
        {/* Render React Flow */}
        <div className="flex items-center justify-center h-full text-gray-400">
          Trainer canvas for: {projectId}
        </div>
      </div>
    </div>
  );
}