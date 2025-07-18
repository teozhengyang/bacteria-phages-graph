export function aggregatePhageClusterInfo(treeData, headers, leafOnly = false) {
  if (!treeData) return null;

  const clusterPhageBacteriaMap = {};

  function processCluster(node) {
    if (!node.children || node.children.length === 0) return;

    if (leafOnly) {
      // Check if all children are leaves (no children themselves)
      const allChildrenAreLeaves = node.children.every(child => !child.children || child.children.length === 0);
      if (allChildrenAreLeaves) {
        // This node is a leaf cluster
        const phageMap = {};
        node.children.forEach(bacteria => {
          headers.forEach((phage, idx) => {
            const val = bacteria.values?.[idx] ?? 0;
            if (val > 0) {
              if (!phageMap[phage]) phageMap[phage] = new Set();
              phageMap[phage].add(bacteria.name);
            }
          });
        });

        clusterPhageBacteriaMap[node.name] = {};
        for (const [phage, bactSet] of Object.entries(phageMap)) {
          clusterPhageBacteriaMap[node.name][phage] = Array.from(bactSet);
        }
      } else {
        // Recurse into children clusters
        node.children.forEach(child => {
          processCluster(child);
        });
      }
    } else {
      // Not leafOnly: include this cluster if it has any bacteria descendants
      const phageMap = {};
      node.children.forEach(child => {
        if (child.children && child.children.length > 0) {
          // child is cluster, recurse
          processCluster(child);
        } else {
          // child is bacteria
          headers.forEach((phage, idx) => {
            const val = child.values?.[idx] ?? 0;
            if (val > 0) {
              if (!phageMap[phage]) phageMap[phage] = new Set();
              phageMap[phage].add(child.name);
            }
          });
        }
      });

      if (Object.keys(phageMap).length > 0) {
        clusterPhageBacteriaMap[node.name] = {};
        for (const [phage, bactSet] of Object.entries(phageMap)) {
          clusterPhageBacteriaMap[node.name][phage] = Array.from(bactSet);
        }
      }
    }
  }

  processCluster(treeData);

  const clusters = Object.keys(clusterPhageBacteriaMap);
  if (clusters.length === 0) {
    return {
      phagesInAllClusters: [],
      clusters: clusterPhageBacteriaMap,
    };
  }

  const phagesPerCluster = clusters.map(c => new Set(Object.keys(clusterPhageBacteriaMap[c])));
  const phagesInAllClusters = [...phagesPerCluster.reduce((a, b) => new Set([...a].filter(x => b.has(x))))];

  return {
    phagesInAllClusters,
    clusters: clusterPhageBacteriaMap,
  };
}
