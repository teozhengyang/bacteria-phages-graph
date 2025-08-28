import { 
  ParsedExcelData, 
  Cluster, 
  BacteriaClusters, 
  ClusterBacteriaOrder, 
  ClusterChildrenOrder, 
  SessionData, 
  TreeNode 
} from '../types';
import { parseExcelFile } from '../utils/excelParser';
import { exportSessionData, importSessionData } from '../utils/sessionUtils';
import { getFileNameWithoutExtension } from '../utils/arrayUtils';

export class DataService {
  static async handleFileUpload(file: File): Promise<{
    data: ParsedExcelData;
    initialState: {
      bacteriaClusters: BacteriaClusters;
      clusterBacteriaOrder: ClusterBacteriaOrder;
      allClusters: Cluster[];
      visibleClusters: string[];
      visiblePhages: string[];
      originalFileName: string;
    };
  }> {
    const parsed = await parseExcelFile(file);
    const nameWithoutExt = getFileNameWithoutExtension(file.name);

    const initialClusters: BacteriaClusters = {};
    const bacteriaChildren = parsed.treeData.children?.[0]?.children || [];
    
    bacteriaChildren
      .filter(b => b && b.name && b.name !== 'undefined')
      .forEach((b) => {
        initialClusters[b.name] = 'Root';
      });

    const clusterBacteriaOrder = { 
      Root: bacteriaChildren
        .filter(b => b && b.name && b.name !== 'undefined')
        .map((b) => b.name) 
    };

    const allClusters = [{ name: 'Root', parent: null }];
    const visibleClusters = ['Root'];
    const visiblePhages = parsed.headers;

    return {
      data: parsed,
      initialState: {
        bacteriaClusters: initialClusters,
        clusterBacteriaOrder,
        allClusters,
        visibleClusters,
        visiblePhages,
        originalFileName: nameWithoutExt,
      },
    };
  }

  static async handleSessionImport(file: File): Promise<SessionData> {
    return await importSessionData(file);
  }

  static handleSessionExport(sessionData: SessionData, originalFileName: string): void {
    exportSessionData(sessionData, originalFileName);
  }

  static buildTreeData(
    data: ParsedExcelData | null,
    allClusters: Cluster[],
    bacteriaClusters: BacteriaClusters,
    clusterBacteriaOrder: ClusterBacteriaOrder,
    clusterChildrenOrder: ClusterChildrenOrder,
    visibleClusters: string[]
  ): TreeNode | null {
    if (!data) return null;

    interface ClusterMapNode extends TreeNode {
      parent: string | null;
      __bacteria?: TreeNode[];
    }

    const clusterMap: { [key: string]: ClusterMapNode } = {};
    allClusters.forEach((c) => {
      clusterMap[c.name] = { name: c.name, parent: c.parent, children: [] };
    });

    const allBacteria = data.treeData?.children?.[0]?.children || [];

    Object.entries(bacteriaClusters).forEach(([bacteriaName, clusterName]) => {
      const key = clusterName || 'Root';
      if (!clusterMap[key]) return;
      const bacteriaInfo = allBacteria.find((b) => b.name === bacteriaName);
      if (bacteriaInfo) {
        if (!clusterMap[key].__bacteria) clusterMap[key].__bacteria = [];
        clusterMap[key].__bacteria!.push(bacteriaInfo);
      }
    });

    Object.entries(clusterMap).forEach(([clusterName, clusterNode]) => {
      const ordered = clusterBacteriaOrder[clusterName] || [];
      const bacteriaInCluster = clusterNode.__bacteria || [];
      const sorted = ordered
        .map(name => bacteriaInCluster.find(b => b.name === name))
        .filter(Boolean) as TreeNode[];
      clusterNode.children = [...(clusterNode.children || []), ...sorted];
      delete clusterNode.__bacteria;
    });

    const rootClusters: ClusterMapNode[] = [];
    Object.values(clusterMap).forEach((clusterNode: ClusterMapNode) => {
      if (clusterNode.parent && clusterMap[clusterNode.parent]) {
        clusterMap[clusterNode.parent].children!.push(clusterNode);
      } else {
        rootClusters.push(clusterNode);
      }
    });

    const filterVisibleClusters = (node: ClusterMapNode): TreeNode | null => {
      if (!visibleClusters.includes(node.name)) return null;
      const filtered = (node.children || [])
        .map((child: TreeNode) => {
          const childNode = child as ClusterMapNode;
          return childNode.parent !== undefined ? filterVisibleClusters(childNode) : child;
        })
        .filter(Boolean) as TreeNode[];
      return { ...node, children: filtered };
    };

    const visibleRoots = rootClusters.map(filterVisibleClusters).filter(Boolean) as TreeNode[];
    return { name: 'Bacteria', children: visibleRoots };
  }

  static validateClusterOperation(
    operation: 'delete' | 'updateParent',
    clusterName: string,
    clusters: Cluster[],
    newParent?: string
  ): { isValid: boolean; errorMessage?: string } {
    if (clusterName === 'Root') {
      return {
        isValid: false,
        errorMessage: operation === 'delete' 
          ? 'Cannot delete the Root cluster.' 
          : 'Cannot change parent of Root cluster.',
      };
    }

    if (operation === 'updateParent' && newParent) {
      // Check for circular dependencies
      const wouldCreateCircle = (childName: string, potentialParentName: string): boolean => {
        if (childName === potentialParentName) return true;
        const parent = clusters.find(c => c.name === potentialParentName);
        if (!parent || !parent.parent) return false;
        return wouldCreateCircle(childName, parent.parent);
      };

      if (wouldCreateCircle(clusterName, newParent)) {
        return {
          isValid: false,
          errorMessage: 'Cannot create circular dependency between clusters.',
        };
      }
    }

    return { isValid: true };
  }
}
