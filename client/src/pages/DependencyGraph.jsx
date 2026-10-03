import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link } from 'react-router-dom';
import { GitFork, Search, Filter, RefreshCw, Layers, ExternalLink, X, ArrowRight } from 'lucide-react';
import api from '../api/client';
import ServiceNode from '../components/graph/ServiceNode';
import StatusBadge from '../components/common/StatusBadge';
import CriticalityBadge from '../components/common/CriticalityBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const nodeTypes = {
  serviceNode: ServiceNode
};

export const DependencyGraph = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [search, setSearch] = useState('');

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dependencies/graph');
      const { nodes: graphNodes, edges: graphEdges } = res.data;

      // Enhance edges with arrowheads
      const styledEdges = (graphEdges || []).map((e) => ({
        ...e,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: e.style?.stroke || '#3b82f6',
          width: 15,
          height: 15
        }
      }));

      setRawNodes(graphNodes || []);
      setRawEdges(styledEdges);
      setNodes(graphNodes || []);
      setEdges(styledEdges);
    } catch (err) {
      console.error('Failed to load dependency graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  // Filter nodes & highlight dependencies when search changes
  useEffect(() => {
    if (!search.trim()) {
      setNodes(rawNodes);
      setEdges(rawEdges);
      return;
    }

    const query = search.toLowerCase();
    const matchingNodeIds = new Set(
      rawNodes
        .filter((n) => n.data.name.toLowerCase().includes(query) || n.data.key.toLowerCase().includes(query) || n.data.teamName.toLowerCase().includes(query))
        .map((n) => n.id)
    );

    setNodes(
      rawNodes.map((n) => ({
        ...n,
        style: {
          opacity: matchingNodeIds.has(n.id) ? 1 : 0.25,
          transition: 'opacity 0.2s'
        }
      }))
    );
  }, [search, rawNodes, rawEdges, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
  }, []);

  // Calculate upstream and downstream dependencies for the selected node
  const selectedNodeDeps = useMemo(() => {
    if (!selectedNode) return { upstream: [], downstream: [] };
    const nodeId = selectedNode.id;

    const upstreamEdges = rawEdges.filter((e) => e.target === nodeId);
    const downstreamEdges = rawEdges.filter((e) => e.source === nodeId);

    const upstream = upstreamEdges.map((e) => ({
      edge: e,
      node: rawNodes.find((n) => n.id === e.source)?.data
    })).filter((item) => Boolean(item.node));

    const downstream = downstreamEdges.map((e) => ({
      edge: e,
      node: rawNodes.find((n) => n.id === e.target)?.data
    })).filter((item) => Boolean(item.node));

    return { upstream, downstream };
  }, [selectedNode, rawEdges, rawNodes]);

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] flex flex-col animate-fadeIn">
      {/* Top Header & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-purple-400" />
            <span>Service Dependency Graph</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive topology mapping upstream callers, downstream providers, and messaging buses
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Highlight service or team..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>

          <button
            onClick={fetchGraph}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reload Graph"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        {loading ? (
          <LoadingSpinner text="Rendering microservice dependency map..." size="lg" />
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
          >
            <Background color="#1e293b" gap={20} size={1.5} />
            <Controls position="bottom-left" />
            <MiniMap
              nodeColor={(n) => {
                if (n.data?.status === 'Down') return '#ef4444';
                if (n.data?.status === 'Degraded') return '#f59e0b';
                return '#3b82f6';
              }}
              position="bottom-right"
            />
          </ReactFlow>
        )}

        {/* Selected Node Details Slide-over Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 sm:w-96 rounded-2xl glass-panel p-5 border border-slate-700/80 shadow-2xl z-40 animate-fadeIn space-y-4 max-h-[85%] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-950 border border-blue-800 text-blue-400">
                  <GitFork className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                  <div className="text-xs font-mono text-slate-400">{selectedNode.key}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <StatusBadge status={selectedNode.status} size="sm" />
              <CriticalityBadge criticality={selectedNode.criticality} size="sm" />
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Team</span>
                <span>{selectedNode.teamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Language</span>
                <span className="font-mono">{selectedNode.language}</span>
              </div>
            </div>

            {/* Upstream Calls */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Services calling this ({selectedNodeDeps.upstream.length})
              </div>
              {selectedNodeDeps.upstream.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No inbound callers</div>
              ) : (
                <div className="space-y-1.5">
                  {selectedNodeDeps.upstream.map(({ node, edge }) => (
                    <div key={edge.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-white font-medium">{node.name}</span>
                      <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.5 rounded bg-slate-800">
                        {edge.label || 'REST'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Downstream Calls */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Calls out to ({selectedNodeDeps.downstream.length})
              </div>
              {selectedNodeDeps.downstream.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No downstream dependencies</div>
              ) : (
                <div className="space-y-1.5">
                  {selectedNodeDeps.downstream.map(({ node, edge }) => (
                    <div key={edge.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                      <span className="text-white font-medium">{node.name}</span>
                      <span className="text-[10px] font-mono text-purple-400 px-1.5 py-0.5 rounded bg-slate-800">
                        {edge.label || 'REST'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <Link
                to={`/services/${selectedNode.id}`}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Open Full Service Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DependencyGraph;
