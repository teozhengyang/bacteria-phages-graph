import { TreeNode, PhageClusterData } from '../types';

export function aggregatePhageClusterInfo(treeData: TreeNode | null, headers: string[]): PhageClusterData | null {
  if (!treeData) return null;

  const clusterPhageBacteriaMap: { [clusterName: string]: { [phageName: string]: { name: string; cluster: string }[] } } = {};

  function processCluster(node: TreeNode): { [phageName: string]: { name: string; cluster: string }[] } {
    if (!node.children || node.children.length === 0) return {};

    const phageMap: { [phageName: string]: { name: string; cluster: string }[] } = {};
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
