import React, { useEffect, useRef, useState } from 'react';
import {
  Network,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Network as VisNetwork, DataSet } from 'vis-network/standalone';
import { Case } from '../types';
import { fetchGraphData, fetchCases } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

interface GraphViewProps {
  onSelectEvidence: (evidenceId: string) => void;
  onOpenRelationshipModal: () => void;
}

const TYPE_NODE_COLORS: Record<string, { bg: string; border: string }> = {
  file: { bg: '#3B82F6', border: '#1D4ED8' },
  image: { bg: '#A855F7', border: '#7E22CE' },
  log: { bg: '#F59E0B', border: '#B45309' },
  email: { bg: '#0EA5E9', border: '#0369A1' },
  url: { bg: '#6366F1', border: '#4338CA' },
  network: { bg: '#10B981', border: '#047857' },
  memory: { bg: '#F43F5E', border: '#BE123C' },
  database: { bg: '#D946EF', border: '#A21CAF' },
};

export const GraphView: React.FC<GraphViewProps> = ({
  onSelectEvidence,
  onOpenRelationshipModal,
}) => {
  const { t, getEvidenceTypeLabel, getRelationshipLabel } = useLanguage();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const networkInstanceRef = useRef<VisNetwork | null>(null);

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGraph = async () => {
    try {
      setIsLoading(true);
      const cList = await fetchCases();
      setCases(cList);

      const graphData = await fetchGraphData(selectedCaseId === 'all' ? undefined : selectedCaseId);

      if (!containerRef.current) return;

      // Transform nodes for Vis.js
      const visNodes = graphData.nodes.map((n) => {
        const colorScheme = TYPE_NODE_COLORS[n.type] || { bg: '#64748B', border: '#334155' };
        return {
          id: n.id,
          label: n.label,
          shape: 'dot',
          size: 22,
          font: { color: '#F8FAFC', size: 12, face: 'Tahoma' },
          color: {
            background: colorScheme.bg,
            border: colorScheme.border,
            highlight: { background: '#818CF8', border: '#4F46E5' },
          },
          borderWidth: 2,
          data: n,
        };
      });

      // Transform edges for Vis.js
      const visEdges = graphData.edges.map((e) => ({
        id: e.id,
        from: e.from,
        to: e.to,
        label: getRelationshipLabel(e.label as any) || e.label,
        font: { color: '#CBD5E1', size: 10, align: 'horizontal' },
        arrows: 'to',
        color: { color: '#64748B', highlight: '#818CF8' },
        width: Math.max(1, Math.round(e.confidence / 30)),
        data: e,
      }));

      const data = {
        nodes: new DataSet(visNodes),
        edges: new DataSet(visEdges),
      };

      const options = {
        physics: {
          enabled: true,
          solver: 'forceAtlas2Based',
          forceAtlas2Based: {
            gravitationalConstant: -50,
            centralGravity: 0.01,
            springLength: 100,
            springConstant: 0.08,
          },
        },
        interaction: {
          hover: true,
          zoomView: true,
          dragView: true,
        },
      };

      if (networkInstanceRef.current) {
        networkInstanceRef.current.destroy();
      }

      const network = new VisNetwork(containerRef.current, data as any, options);
      networkInstanceRef.current = network;

      network.on('selectNode', (params) => {
        if (params.nodes.length > 0) {
          const nodeObj = visNodes.find((n) => n.id === params.nodes[0]);
          if (nodeObj) {
            setSelectedNode(nodeObj.data);
          }
        }
      });

      network.on('deselectNode', () => {
        setSelectedNode(null);
      });
    } catch (err: any) {
      console.error('Error loading graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, [selectedCaseId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-purple-500" />
            <span>{t('graph_view_title')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('graph_view_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">{t('show_all_cases')}</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.case_number} - {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={onOpenRelationshipModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow transition"
          >
            + {t('add_relationship')}
          </button>
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-500">{t('color_legend')}</span>
          {['file', 'image', 'log', 'email', 'url', 'network', 'memory', 'database'].map((typeKey) => {
            const color = TYPE_NODE_COLORS[typeKey]?.bg || '#64748B';
            return (
              <div key={typeKey} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-700 dark:text-slate-300">
                  {getEvidenceTypeLabel(typeKey as any).label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reload */}
        <button
          onClick={loadGraph}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('reset_network')}</span>
        </button>
      </div>

      {/* Main Canvas + Side Panel */}
      <div className="relative grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl h-[600px] overflow-hidden relative shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-slate-400 text-xs">
              {t('loading_graph')}
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Selected Node Drawer */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>{t('selected_node_details')}</span>
          </h3>

          {selectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">{t('node_name')}</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedNode.label}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('node_type')}</span>
                <span className="font-mono text-indigo-500 font-bold">{selectedNode.type}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('node_case')}</span>
                <span className="font-mono font-semibold">{selectedNode.case_number}</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">{t('node_md5')}</span>
                <span className="font-mono text-[10px] text-slate-300 break-all">{selectedNode.md5}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onSelectEvidence(selectedNode.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
                >
                  {t('open_evidence_page')}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Network className="w-8 h-8 text-slate-600 mx-auto" />
              <p>{t('click_node_hint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
