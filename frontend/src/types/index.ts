/**
 * Core data types for bacteria and phage visualization system
 */

/**
 * Represents individual bacteria data with associated phage values
 * @interface BacteriaData
 * @property name - The name/identifier of the bacteria
 * @property values - Optional array of numeric values representing phage interactions
 */
export interface BacteriaData {
  name: string;
  values?: number[];
}

/**
 * Represents a node in the hierarchical tree structure
 * Used for both bacteria and cluster nodes in the visualization
 * @interface TreeNode
 * @property name - The display name of the node
 * @property children - Optional array of child nodes
 * @property values - Optional array of numeric values (phage interaction data)
 * @property parent - Optional parent node identifier for hierarchy tracking
 */
export interface TreeNode {
  name: string;
  children?: TreeNode[];
  values?: number[];
  parent?: string | null;
}

/**
 * Root-level tree structure containing all hierarchical data
 * @interface TreeData
 * @property name - Root node name (typically "Bacteria")
 * @property children - Array of top-level tree nodes
 */
export interface TreeData {
  name: string;
  children: TreeNode[];
}

/**
 * Complete parsed data from Excel file upload
 * Contains both the phage headers and the hierarchical bacteria data
 * @interface ParsedExcelData
 * @property headers - Array of phage names from Excel column headers
 * @property treeData - Hierarchical structure of bacteria and their data
 */
export interface ParsedExcelData {
  headers: string[];
  treeData: TreeData;
}

/**
 * Cluster management types for organizing bacteria into custom groups
 */

/**
 * Represents a custom cluster that can contain bacteria or other clusters
 * @interface Cluster
 * @property name - Unique identifier for the cluster
 * @property parent - Parent cluster name or null for root-level clusters
 */
export interface Cluster {
  name: string;
  parent: string | null;
}

/**
 * Maps each bacteria to its assigned cluster
 * Key: bacteria name, Value: cluster name
 * @interface BacteriaClusters
 */
export interface BacteriaClusters {
  [bacteriaName: string]: string;
}

/**
 * Defines the display order of bacteria within each cluster
 * Key: cluster name, Value: ordered array of bacteria names
 * @interface ClusterBacteriaOrder
 */
export interface ClusterBacteriaOrder {
  [clusterName: string]: string[];
}

/**
 * Defines the display order of child clusters within parent clusters
 * Key: parent cluster name, Value: ordered array of child cluster names
 * @interface ClusterChildrenOrder
 */
export interface ClusterChildrenOrder {
  [clusterName: string]: string[];
}

/**
 * Phage cluster information types for detailed interaction data
 */

/**
 * Represents a contributor (bacteria) to a specific phage-cluster interaction
 * @interface PhageClusterContributor
 * @property name - The bacteria name
 * @property cluster - The cluster the bacteria belongs to
 */
export interface PhageClusterContributor {
  name: string;
  cluster: string;
}

/**
 * Comprehensive data structure mapping phage-cluster interactions
 * Nested structure: clusters -> phages -> contributing bacteria
 * @interface PhageClusterData
 * @property clusters - Mapping of cluster names to their phage interactions
 */
export interface PhageClusterData {
  clusters: {
    [clusterName: string]: {
      [phageName: string]: PhageClusterContributor[];
    };
  };
}

/**
 * Processed result for displaying phage cluster information in modals
 * @interface PhageClusterResult
 * @property label - Display label for the phage-cluster combination
 * @property contributors - Array of bacteria contributing to this interaction
 */
export interface PhageClusterResult {
  label: string;
  contributors: PhageClusterContributor[];
}

/**
 * Component prop types for type-safe React component interfaces
 */

/**
 * Props interface for the TreeMatrix visualization component
 * Contains all data and configuration needed for rendering the matrix
 * @interface TreeMatrixProps  
 * @property treeData - The hierarchical data structure to visualize
 * @property visibleClusters - Array of cluster names currently shown
 * @property visiblePhages - Array of phage names currently shown
 * @property bacteriaClusterOrderArr - Optional ordered list of cluster names
 * @property clusterChildrenOrder - Ordering configuration for nested clusters
 * @property clusterBacteriaOrder - Ordering configuration for bacteria within clusters
 */
export interface TreeMatrixProps {
  treeData: TreeNode | null;
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusterOrderArr?: string[];
  clusterChildrenOrder: ClusterChildrenOrder;
  clusterBacteriaOrder: ClusterBacteriaOrder;
}

/**
 * Props interface for the PhageClusterInfoModal component
 * @interface PhageClusterInfoModalProps
 * @property isOpen - Whether the modal is currently displayed
 * @property onClose - Callback function to close the modal
 * @property data - Phage cluster interaction data to display
 */
export interface PhageClusterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PhageClusterData | null;
}

/**
 * Session management and utility types
 */

/**
 * Complete session data structure for saving/loading application state
 * Contains all user configuration and customizations
 * @interface SessionData
 * @property allClusters - All clusters created by the user
 * @property visibleClusters - Currently visible clusters in the visualization
 * @property visiblePhages - Currently visible phages in the visualization
 * @property bacteriaClusters - Mapping of bacteria to their assigned clusters
 * @property clusterBacteriaOrder - Display order of bacteria within each cluster
 * @property clusterChildrenOrder - Optional display order of child clusters
 */
export interface SessionData {
  allClusters: Cluster[];
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusters: BacteriaClusters;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder?: ClusterChildrenOrder;
}

/**
 * Theme type definition for consistent theming across the application
 */
export type Theme = 'light' | 'dark';

/**
 * Enhanced D3 hierarchy node with additional visualization properties
 * Extends the standard d3.HierarchyNode with custom positioning and visibility data
 * @interface D3HierarchyNode
 * @property x - Optional x-coordinate for positioning
 * @property y - Optional y-coordinate for positioning
 * @property clusterHeight - Optional height calculation for cluster visualization
 * @property data - Enhanced tree node data with visibility state
 */
export interface D3HierarchyNode extends d3.HierarchyNode<TreeNode> {
  x?: number;
  y?: number;
  clusterHeight?: number;
  data: TreeNode & { _visible?: boolean };
}
