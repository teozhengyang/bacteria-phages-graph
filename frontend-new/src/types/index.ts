// Core data types
export interface BacteriaData {
  name: string;
  values?: number[];
}

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  values?: number[];
  parent?: string | null;
}

export interface TreeData {
  name: string;
  children: TreeNode[];
}

export interface ParsedExcelData {
  headers: string[];
  treeData: TreeData;
}

// Cluster management types
export interface Cluster {
  name: string;
  parent: string | null;
}

export interface BacteriaClusters {
  [bacteriaName: string]: string;
}

export interface ClusterBacteriaOrder {
  [clusterName: string]: string[];
}

export interface ClusterChildrenOrder {
  [clusterName: string]: string[];
}

// Phage cluster info types
export interface PhageClusterContributor {
  name: string;
  cluster: string;
}

export interface PhageClusterData {
  clusters: {
    [clusterName: string]: {
      [phageName: string]: PhageClusterContributor[];
    };
  };
}

// Modal types
export interface PhageClusterResult {
  label: string;
  contributors: PhageClusterContributor[];
}

// Component prop types
export interface FileUploaderProps {
  onFile: (file: File) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export interface TreeMatrixProps {
  treeData: TreeNode | null;
  headers: string[];
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusterOrderArr?: string[];
  theme?: 'light' | 'dark';
  clusterChildrenOrder: ClusterChildrenOrder;
  clusterBacteriaOrder: ClusterBacteriaOrder;
}

export interface CustomiserPanelProps {
  headers: string[];
  clusters: Cluster[];
  visibleClusters: string[];
  visiblePhages: string[];
  setVisibleClusters: React.Dispatch<React.SetStateAction<string[]>>;
  setVisiblePhages: React.Dispatch<React.SetStateAction<string[]>>;
  bacteria: string[];
  bacteriaClusters: BacteriaClusters;
  setBacteriaClusters: React.Dispatch<React.SetStateAction<BacteriaClusters>>;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  setClusterBacteriaOrder: React.Dispatch<React.SetStateAction<ClusterBacteriaOrder>>;
  addCluster: (clusterName: string, parentName?: string | null) => void;
  deleteCluster: (clusterName: string) => void;
  updateClusterParent: (clusterName: string, newParent: string | null) => void;
  clusterChildrenOrder: ClusterChildrenOrder;
  setClusterChildrenOrder: React.Dispatch<React.SetStateAction<ClusterChildrenOrder>>;
  importSession: (file: File) => void;
  exportSession: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  clusterInfoData: PhageClusterData | null;
}

export interface PhageClusterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PhageClusterData | null;
}

// Session data types
export interface SessionData {
  allClusters: Cluster[];
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusters: BacteriaClusters;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder?: ClusterChildrenOrder;
}

// Theme types
export type Theme = 'light' | 'dark';

// D3 related types
export interface D3HierarchyNode extends d3.HierarchyNode<TreeNode> {
  x?: number;
  y?: number;
  clusterHeight?: number;
  data: TreeNode & { _visible?: boolean };
}
