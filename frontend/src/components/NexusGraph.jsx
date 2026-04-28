import React, { useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { motion } from 'framer-motion';

const NexusGraph = ({ agentId }) => {
  const [data, setData] = React.useState({ nodes: [], links: [] });

  React.useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const response = await fetch('http://localhost:8080/network?targets=elonmusk,zuck,jeffbezos', {
          headers: { 'X-Agent-ID': agentId }
        });
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error("Network fetch failed:", err);
      }
    };
    fetchNetwork();
  }, [agentId]);

  return (
    <div className="h-full w-full relative glass-panel overflow-hidden">
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-cyber-cyan bg-black/50 p-2 border border-cyber-cyan/20 rounded">
        NEXUS_ENGINE: ACTIVE<br/>
        NODES: {data.nodes.length}<br/>
        EDGES: {data.links.length}<br/>
        MODE: 3D_CORRELATION
      </div>

      <ForceGraph3D
        graphData={data}
        backgroundColor="rgba(0,0,0,0)"
        nodeLabel="id"
        nodeAutoColorBy="group"
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => 'rgba(0, 242, 255, 0.2)'}
        showNavInfo={false}
      />

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <button className="px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/30 text-[10px] text-cyber-cyan hover:bg-cyber-cyan/30 transition-all">
          RESET VIEW
        </button>
        <button className="px-3 py-1 bg-cyber-purple/10 border border-cyber-purple/30 text-[10px] text-cyber-purple hover:bg-cyber-purple/30 transition-all">
          EXPORT NET
        </button>
      </div>
    </div>
  );
};

export default NexusGraph;
