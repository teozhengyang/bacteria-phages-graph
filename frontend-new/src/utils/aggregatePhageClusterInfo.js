// aggregatePhageClusterInfo.js

/**
 * Processes treeData and headers to extract:
 * - phages found in all clusters
 * - for each cluster: phages found and which bacteria contribute
 * 
 * Assumes:
 * - treeData: { name, children: [ { name: clusterName, children: [ {name:bacteria, values: [...]}, ... ] }, ... ] }
 * - headers: array of phage names
 * - A phage is "found" in bacteria if its corresponding value > 0
 */
export function aggregatePhageClusterInfo(treeData, headers) {
  if (!treeData || !treeData.children) return null;

  const clusterPhageBacteriaMap = {}; // cluster -> phage -> [bacteria names]

  // Gather phages present per cluster per bacteria
  treeData.children.forEach(cluster => {
    const phageMap = {}; // phageName -> set of bacteria names
    cluster.children.forEach(bacteria => {
      headers.forEach((phage, idx) => {
        const val = bacteria.values?.[idx] ?? 0;
        if (val > 0) {
          if (!phageMap[phage]) phageMap[phage] = new Set();
          phageMap[phage].add(bacteria.name);
        }
      });
    });
    // Convert sets to arrays for easier use later
    clusterPhageBacteriaMap[cluster.name] = {};
    for (const [phage, bactSet] of Object.entries(phageMap)) {
      clusterPhageBacteriaMap[cluster.name][phage] = Array.from(bactSet);
    }
  });

  // Compute phages found in all clusters = intersection of phages keys of all clusters
  const clusters = Object.keys(clusterPhageBacteriaMap);
  if (clusters.length === 0) {
    return {
      phagesInAllClusters: [],
      clusters: clusterPhageBacteriaMap,
    };
  }

  const phagesPerCluster = clusters.map(c => new Set(Object.keys(clusterPhageBacteriaMap[c])));
  // Intersection of sets:
  const phagesInAllClusters = [...phagesPerCluster.reduce((a, b) => new Set([...a].filter(x => b.has(x))))];

  return {
    phagesInAllClusters,
    clusters: clusterPhageBacteriaMap,
  };
}
