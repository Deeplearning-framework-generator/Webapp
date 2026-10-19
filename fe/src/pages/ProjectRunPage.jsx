import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ExternalLink, 
  Square, 
  ChevronDown,
  Clock,
  CheckCircle2,
  Circle,
  Download
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ProjectRunPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleBuildClick = (projectId) => {
    navigate(`/projects/${projectId}`, {});
  };

  // Mock data to match the screenshot
  const mockData = {
    name: 'skip-v2',
    status: 'Training',
    pipeline: [
      { label: 'Queued', time: '14:01', status: 'completed' },
      { label: 'Waiting for Colab', sub: 'Run all pressed 14:02', time: '14:02', status: 'completed' },
      { label: 'Connected', sub: 'Bundle downloaded 14:03', time: '14:03', status: 'completed' },
      { label: 'Training', sub: 'Epoch 9 of 20', time: '', status: 'active' },
      { label: 'Finished', sub: 'Not yet', time: '', status: 'pending' },
    ],
    metrics: {
      currentEpoch: 9,
      totalEpochs: 20,
      trainLoss: 0.71,
      valLoss: 0.82,
      bestValAcc: '74.1%',
      bestEpoch: 'epoch 8'
    },
    config: {
      runtime: 'Colab, T4 GPU',
      lr: '0.0005',
      epochs: 20,
      batch: 64
    },
    logs: [
      { time: '14:12:44', level: 'INFO', msg: 'step=3500 loss=0.6981' },
      { time: '14:12:44', level: 'INFO', msg: 'step=3500 loss=0.6981' },
      { time: '14:12:44', level: 'INFO', msg: 'step=3500 loss=0.7134' },
      { time: '14:13:35', level: 'INFO', msg: 'step=3600 lr=0.00045' },
      { time: '14:13:35', level: 'INFO', msg: 'Epoch 8 complete, avg_loss=0.7689' },
      { time: '14:13:36', level: 'INFO', msg: 'Epoch 8 val_acc=0.741, best=0.741' },
      { time: '14:13:36', level: 'INFO', msg: 'Saved checkpoint to runs/skip-v2/latest.pt' },
      { time: '14:13:37', level: 'INFO', msg: 'Uploaded latest.pt to the project' },
      { time: '14:13:38', level: 'INFO', msg: 'step=3700 loss=0.7208' },
      { time: '14:13:40', level: 'INFO', msg: 'step=3700 loss=0.7064' },
    ],
    files: [
      { name: 'latest.pt', size: '2.7 MB' },
      { name: 'epoch_8.pt', size: '2.7 MB' },
      { name: 'train_curves_epoch8.png', size: '64 KB' },
      { name: 'metrics.csv', size: '92 KB' },
      { name: 'config.yaml', size: '1 KB' },
      { name: 'blocks/ (code used)', size: '6 KB' },
    ]
  };

  return (
    <div className="h-screen flex flex-col bg-page text-ink font-sans overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-ink">{mockData.name}</h1>
            <StatusBadge status={mockData.status} />
          </div>
          <div className="flex gap-3">
            <div className="flex bg-surface-soft border border-line rounded-md p-0.5">
                <button className="px-3 py-1 text-xs font-medium text-muted hover:text-ink"
                onClick={() => handleBuildClick(projectId)}
                >Build</button>
                <button 
                className="px-3 py-1 text-xs font-medium bg-surface rounded shadow-sm text-ink">Runs
                </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-md text-sm font-medium text-ink hover:bg-hover shadow-sm transition-colors">
            <ExternalLink size={16} />
            Open in Colab
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 shadow-sm transition-colors">
              <Square size={16} fill="currentColor" />
              Stop run
            </button>
          </div>
        </div>

        {/* Pipeline Status Card */}
        <div className="bg-surface rounded-xl border border-line p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 relative">
            {/* Progress Line Background */}
            <div className="absolute top-3 left-0 w-full h-0.5 bg-line -z-10" />
            <div className="absolute top-3 left-0 w-[60%] h-0.5 bg-ok -z-10" />

            {mockData.pipeline.map((step, idx) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              
              return (
                <div key={idx} className="flex flex-col items-start gap-1 relative z-10 w-1/5">
                  <div className={`flex items-center gap-2 font-medium text-sm ${isActive ? 'text-accent' : 'text-ink'}`}>
                    {isCompleted ? (
                      <CheckCircle2 size={18} className="text-ok bg-surface" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border-2 border-accent bg-surface flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      </div>
                    ) : (
                      <Circle size={18} className="text-muted opacity-50 bg-surface" />
                    )}
                    {step.label}
                  </div>
                  {step.time && <span className="text-xs text-muted pl-6">{step.time}</span>}
                  {step.sub && <span className="text-xs text-muted opacity-80 pl-6">{step.sub}</span>}
                </div>
              );
            })}
          </div>
          
          {/* Footer Info Row */}
          <div className="flex items-center gap-6 text-xs text-muted pt-4 border-t border-line">
            <div className="flex items-center gap-2">
              <Clock size={14} />
              Last heartbeat: <span className="font-medium text-ink">12 s ago</span>
            </div>
            <div>Mode: <span className="font-medium text-ink">Train</span></div>
            <div>Elapsed: <span className="font-medium text-ink">11 min</span></div>
            <div>Runtime: <span className="font-medium text-ink">{mockData.config.runtime}</span></div>
            <div>Config: <span className="font-medium text-ink">lr {mockData.config.lr}, {mockData.config.epochs} epochs, batch {mockData.config.batch}</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-line mb-6">
          {['Overview', 'Charts', 'Plots (2)', 'Logs', 'Files (6)'].map((tab, i) => (
            <button 
              key={tab} 
              className={`pb-3 text-sm font-medium transition-colors ${i === 0 ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-ink'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-surface p-5 rounded-xl border border-line shadow-sm">
            <div className="text-xs text-muted mb-2">Epoch</div>
            <div className="text-2xl font-semibold text-ink">
              {mockData.metrics.currentEpoch} <span className="text-base text-muted font-normal">of {mockData.metrics.totalEpochs}</span>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-line shadow-sm">
            <div className="text-xs text-muted mb-2">Train loss</div>
            <div className="text-2xl font-semibold text-ink">{mockData.metrics.trainLoss}</div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-line shadow-sm">
            <div className="text-xs text-muted mb-2">Val loss</div>
            <div className="text-2xl font-semibold text-ink">{mockData.metrics.valLoss}</div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-line shadow-sm relative">
            <div className="text-xs text-muted mb-2">Best val/acc</div>
            <div className="text-2xl font-semibold text-ink">{mockData.metrics.bestValAcc}</div>
            <div className="absolute bottom-5 right-5 text-xs text-muted">{mockData.metrics.bestEpoch}</div>
          </div>
        </div>

        {/* Charts & Logs Grid */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          
          {/* Chart Container - Loss */}
          <div className="bg-surface rounded-xl border border-line shadow-sm p-5 flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-ink">Loss per epoch</h3>
              <div className="flex gap-4 text-xs text-muted">
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-blue-500"></div> train loss</div>
                <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-orange-500"></div> val loss</div>
              </div>
            </div>
            <div className="flex-1 bg-surface-soft rounded-lg border border-line relative flex items-center justify-center overflow-hidden">
               {/* Mocking the chart curve visually */}
               <svg className="w-full h-full p-4" viewBox="0 0 400 200" preserveAspectRatio="none">
                 <path d="M 0,20 Q 50,50 100,90 T 200,120 T 400,130" fill="none" stroke="#3b82f6" strokeWidth="2" />
                 <path d="M 0,20 Q 50,60 100,100 T 200,130 T 400,140" fill="none" stroke="#f97316" strokeWidth="2" />
                 <circle cx="200" cy="120" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
                 <circle cx="200" cy="130" r="4" fill="white" stroke="#f97316" strokeWidth="2"/>
                 <line x1="200" y1="0" x2="200" y2="200" stroke="#e5e7eb" strokeDasharray="4 4" />
               </svg>
               <div className="absolute top-1/2 right-1/4 bg-white p-1 rounded shadow text-[10px] border border-line">
                 <div className="text-orange-500">val 0.82</div>
                 <div className="text-blue-500">train 0.71</div>
               </div>
            </div>
          </div>

          {/* Live Log Container */}
          <div className="bg-surface rounded-xl border border-line shadow-sm flex flex-col overflow-hidden h-[300px]">
            <div className="flex justify-between items-center p-4 border-b border-line">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <h3 className="text-sm font-semibold text-ink">Live log</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Level</span>
                <button className="flex items-center gap-1 text-xs border border-line rounded px-2 py-1 bg-surface-soft text-ink hover:bg-hover transition-colors">
                  All <ChevronDown size={12} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-surface-soft p-4 overflow-y-auto font-mono text-[11px] leading-relaxed">
              {mockData.logs.map((log, i) => (
                <div key={i} className="flex gap-2 mb-1">
                  <span className="text-muted shrink-0">{log.time}</span>
                  <span className="text-ok font-semibold shrink-0">{log.level}</span>
                  <span className="text-ink break-all opacity-90">{log.msg}</span>
                </div>
              ))}
            </div>
            
            <div className="p-3 border-t border-line bg-surface">
              <button className="text-xs font-semibold text-accent hover:opacity-80 transition-opacity">
                Open full log
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Section Grid - Val Accuracy & Files */}
        <div className="grid grid-cols-2 gap-6">

           {/* Chart Container - Val Accuracy */}
           <div className="bg-surface rounded-xl border border-line shadow-sm p-5 flex flex-col h-[300px]">
            <h3 className="text-sm font-semibold text-ink mb-4">Validation accuracy</h3>
            <div className="flex-1 bg-surface-soft rounded-lg border border-line relative flex items-center justify-center overflow-hidden">
               {/* Mocking the chart curve visually */}
               <svg className="w-full h-full p-4" viewBox="0 0 400 200" preserveAspectRatio="none">
                 <path d="M 0,200 Q 100,50 200,50 T 400,50" fill="none" stroke="#3b82f6" strokeWidth="2" />
                 <circle cx="200" cy="50" r="4" fill="white" stroke="#3b82f6" strokeWidth="2"/>
               </svg>
               <div className="absolute top-1/4 right-1/2 bg-white p-1 rounded shadow text-[10px] border border-line">
                 <div className="text-ink font-semibold">best 74.1%</div>
               </div>
               <div className="absolute top-1/3 right-1/4 text-xs text-muted font-medium">73.8%</div>
            </div>
          </div>

          {/* Files Panel */}
          <div className="bg-surface rounded-xl border border-line shadow-sm flex flex-col overflow-hidden h-[300px]">
             <div className="flex justify-between items-center p-4 border-b border-line">
              <h3 className="text-sm font-semibold text-ink">Files</h3>
              <span className="text-xs text-muted">Saved in the project</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <tbody>
                  {mockData.files.map((file, i) => (
                    <tr key={i} className="border-b border-line last:border-0 hover:bg-hover">
                      <td className="px-4 py-3 text-ink font-medium">{file.name}</td>
                      <td className="px-4 py-3 text-right text-muted">{file.size}</td>
                      <td className="px-4 py-3 text-right">
                        <Download size={14} className="inline text-muted hover:text-ink cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-line bg-surface flex gap-3">
              <button className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-2 rounded text-xs font-semibold transition-colors">
                Download all (.zip)
              </button>
              <button className="flex-1 border border-line bg-surface text-ink py-2 rounded text-xs font-semibold hover:bg-hover transition-colors">
                Resume from latest
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}