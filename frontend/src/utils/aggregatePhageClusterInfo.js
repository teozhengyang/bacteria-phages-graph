export function aggregatePhageClusterInfo(treeData, headers) {
  if (!treeData) return null;

  const clusterPhageBacteriaMap = {};

  function processCluster(node) {
    if (!node.children || node.children.length === 0) return {};

    let phageMap = {};
    let hasBacteria = false;

    node.children.forEach(child => {
      if (child.children && child.children.length > 0) {
        // Child is a cluster - recurse and get its phage map
        const childPhageMap = processCluster(child);
        // Merge child phage map into current
        for (const [phage, bactList] of Object.entries(childPhageMap)) {
          if (!phageMap[phage]) phageMap[phage] = [];
          phageMap[phage].push(...bactList);
        }
      } else {
        // Child is bacteria node
        hasBacteria = true;
        headers.forEach((phage, idx) => {
          const val = child.values?.[idx] ?? 0;
          if (val > 0) {
            if (!phageMap[phage]) phageMap[phage] = [];
            phageMap[phage].push({ name: child.name, cluster: node.name });
          }
        });
      }
    });

    if (hasBacteria || Object.keys(phageMap).length > 0) {
      clusterPhageBacteriaMap[node.name] = {};
      for (const [phage, bactList] of Object.entries(phageMap)) {
        clusterPhageBacteriaMap[node.name][phage] = bactList;
      }
    }

    return phageMap;
  }

  processCluster(treeData);

  return {
    clusters: clusterPhageBacteriaMap,
  };
}
