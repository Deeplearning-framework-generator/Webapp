import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Settings, ArrowLeft, Play } from 'lucide-react';

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Mock project data
  const project = {
    id: projectId,
    name: projectId,
    updated: '2 hours ago',
  };

  const handleRunClick = (projectId) => {
    navigate(`/projects/${projectId}/runs`,{});
  };

  return (
    <div className="h-screen flex flex-col text-ink bg-page">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-line bg-surface">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/projects')}
            className="p-1.5 hover:bg-hover rounded-md"
          >
            <ArrowLeft className="w-4 h-4 text-ink" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-ink">{project.name}</h1>
            <p className="text-xs text-muted">Saved {project.updated}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-soft border border-line rounded-md p-0.5">
            <button className="px-3 py-1 text-xs font-medium bg-surface rounded shadow-sm text-ink">Build</button>
            <button 
              className="px-3 py-1 text-xs font-medium text-muted hover:text-ink"
              onClick={() => handleRunClick(projectId)}
            >
              Runs
            </button>
          </div>
          <span className="text-xs text-ok bg-ok/10 px-2 py-1 rounded-full">Valid, 10 connections</span>
          <button className="px-3 py-1 text-xs border border-line rounded-md text-muted hover:bg-hover">···</button>
          <button className="flex items-center gap-1.5 px-3 py-1 text-xs border border-line rounded-md text-ink hover:bg-hover">
            <Settings className="w-3 h-3" />
            Config
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 text-xs bg-ok text-white rounded-md hover:opacity-90">
            <Play className="w-3 h-3" />
            Run
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 bg-page relative">
        {/* Render React Flow */}
        <div className="flex items-center justify-center h-full text-muted">
          Trainer canvas for: {projectId}
        </div>
      </div>
    </div>
  );
}