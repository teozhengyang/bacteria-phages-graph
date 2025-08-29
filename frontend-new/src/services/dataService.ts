/**
 * Data Service - Central hub for all data processing operations
 * 
 * This service handles:
 * - File upload processing and data parsing
 * - Session import/export functionality
 * - Tree data structure building for visualization
 * - Cluster operation validation and business logic
 * 
 * Acts as an abstraction layer between the UI and data processing utilities
 */

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
  /**
   * Process uploaded Excel file and generate initial application state
   * 
   * Handles the complete workflow of:
   * 1. Parsing the Excel file
   * 2. Extracting bacteria and phage information
   * 3. Setting up initial cluster configurations
   * 4. Preparing default visibility settings
   * 
   * @param {File} file - The uploaded Excel file
   * @returns {Promise<Object>} Parsed data and initial state configuration
   */
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
    // Parse the Excel file to extract structured data
    const parsed = await parseExcelFile(file);
    const nameWithoutExt = getFileNameWithoutExtension(file.name);

    // Extract bacteria children from the parsed tree structure
    // The structure is typically: Root -> Bacteria -> [Individual Bacteria]
    const bacteriaChildren = parsed.treeData.children?.[0]?.children || [];
    
    // Initialize all bacteria to be assigned to the Root cluster
    const initialClusters: BacteriaClusters = {};
    bacteriaChildren
      .filter(b => b && b.name && b.name !== 'undefined') // Filter out invalid entries
      .forEach((b) => {
        initialClusters[b.name] = 'Root';
      });

    // Set up initial ordering with all bacteria in the Root cluster
    const clusterBacteriaOrder = { 
      Root: bacteriaChildren
        .filter(b => b && b.name && b.name !== 'undefined')
        .map((b) => b.name) 
    };

    // Configure initial application state
    const allClusters = [{ name: 'Root', parent: null }]; // Start with Root cluster only
    const visibleClusters = ['Root']; // Show Root cluster by default
    const visiblePhages = parsed.headers; // Show all phages by default

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

  /**
   * Import session data from a previously saved session file
   * 
   * @param {File} file - The session JSON file
   * @returns {Promise<SessionData>} Parsed session configuration
   */
  static async handleSessionImport(file: File): Promise<SessionData> {
    return await importSessionData(file);
  }

  /**
   * Export current session configuration to a downloadable file
   * 
   * @param {SessionData} sessionData - Current application state to save
   * @param {string} originalFileName - Base filename for the export
   */
  static handleSessionExport(sessionData: SessionData, originalFileName: string): void {
    exportSessionData(sessionData, originalFileName);
  }

  /**
   * Build hierarchical tree data structure for visualization
   * 
   * This complex function transforms the flat data structures into a hierarchical
   * tree that can be consumed by the D3.js visualization components.
   * 
   * Process:
   * 1. Create cluster nodes with proper parent-child relationships
   * 2. Assign bacteria to their respective clusters
   * 3. Apply custom ordering for both clusters and bacteria
   * 4. Filter based on visibility settings
   * 5. Return formatted tree structure
   * 
   * @param {ParsedExcelData | null} data - Parsed Excel data
   * @param {Cluster[]} allClusters - All user-created clusters
   * @param {BacteriaClusters} bacteriaClusters - Bacteria-to-cluster assignments
   * @param {ClusterBacteriaOrder} clusterBacteriaOrder - Bacteria ordering within clusters
   * @param {ClusterChildrenOrder} clusterChildrenOrder - Child cluster ordering
   * @param {string[]} visibleClusters - Currently visible clusters
   * @returns {TreeNode | null} Hierarchical tree structure or null if no data
   */
  static buildTreeData(
    data: ParsedExcelData | null,
    allClusters: Cluster[],
    bacteriaClusters: BacteriaClusters,
    clusterBacteriaOrder: ClusterBacteriaOrder,
    clusterChildrenOrder: ClusterChildrenOrder,
    visibleClusters: string[]
  ): TreeNode | null {
    if (!data) return null;

    // Extended cluster node interface for internal processing
    interface ClusterMapNode extends TreeNode {
      parent: string | null;
      __bacteria?: TreeNode[]; // Temporary storage for bacteria during processing
    }

    // Step 1: Create cluster nodes map for easy lookup and manipulation
    const clusterMap: { [key: string]: ClusterMapNode } = {};
    allClusters.forEach((c) => {
      clusterMap[c.name] = { name: c.name, parent: c.parent, children: [] };
    });

    // Step 2: Extract all bacteria from the original data structure
    const allBacteria = data.treeData?.children?.[0]?.children || [];

    // Step 3: Assign bacteria to their respective clusters
    Object.entries(bacteriaClusters).forEach(([bacteriaName, clusterName]) => {
      const key = clusterName || 'Root'; // Default to Root if cluster name is empty
      if (!clusterMap[key]) return; // Skip if cluster doesn't exist
      
      // Find the bacteria data in the original structure
      const bacteriaInfo = allBacteria.find((b) => b.name === bacteriaName);
      if (bacteriaInfo) {
        // Add bacteria to temporary storage for this cluster
        if (!clusterMap[key].__bacteria) clusterMap[key].__bacteria = [];
        clusterMap[key].__bacteria!.push(bacteriaInfo);
      }
    });

    // Step 4: Apply custom ordering to bacteria within each cluster
    Object.entries(clusterMap).forEach(([clusterName, clusterNode]) => {
      const ordered = clusterBacteriaOrder[clusterName] || [];
      const bacteriaInCluster = clusterNode.__bacteria || [];
      
      // Sort bacteria according to the custom order, then add any remaining bacteria
      const sorted = ordered
        .map(name => bacteriaInCluster.find(b => b.name === name))
        .filter(Boolean) as TreeNode[];
      
      // Add ordered bacteria to the cluster's children
      clusterNode.children = [...(clusterNode.children || []), ...sorted];
      
      // Clean up temporary bacteria storage
      delete clusterNode.__bacteria;
    });

    // Step 5: Build the cluster hierarchy by connecting parent-child relationships
    const rootClusters: ClusterMapNode[] = [];
    Object.values(clusterMap).forEach((clusterNode: ClusterMapNode) => {
      if (clusterNode.parent && clusterMap[clusterNode.parent]) {
        // Add this cluster as a child of its parent
        clusterMap[clusterNode.parent].children!.push(clusterNode);
      } else {
        // This is a root-level cluster
        rootClusters.push(clusterNode);
      }
    });

    // Step 6: Filter tree based on visibility settings
    const filterVisibleClusters = (node: ClusterMapNode): TreeNode | null => {
      // Hide clusters that are not in the visible list
      if (!visibleClusters.includes(node.name)) return null;
      
      // Recursively filter child nodes
      const filtered = (node.children || [])
        .map((child: TreeNode) => {
          const childNode = child as ClusterMapNode;
          // If child has a parent property, it's a cluster node - apply filtering
          // Otherwise, it's a bacteria node - keep it as is
          return childNode.parent !== undefined ? filterVisibleClusters(childNode) : child;
        })
        .filter(Boolean) as TreeNode[];
      
      return { ...node, children: filtered };
    };

    // Step 7: Apply filtering to all root clusters and return final structure
    const visibleRoots = rootClusters.map(filterVisibleClusters).filter(Boolean) as TreeNode[];
    return { name: 'Bacteria', children: visibleRoots };
  }

  /**
   * Validate cluster operations to prevent invalid states
   * 
   * Performs business logic validation for cluster operations:
   * - Prevents deletion of the Root cluster
   * - Prevents circular dependencies in cluster hierarchy
   * - Validates parent-child relationships
   * 
   * @param {string} operation - Type of operation ('delete' | 'updateParent')
   * @param {string} clusterName - Name of the cluster being operated on
   * @param {Cluster[]} clusters - All existing clusters
   * @param {string} [newParent] - New parent name for updateParent operations
   * @returns {Object} Validation result with success status and error message
   */
  static validateClusterOperation(
    operation: 'delete' | 'updateParent',
    clusterName: string,
    clusters: Cluster[],
    newParent?: string
  ): { isValid: boolean; errorMessage?: string } {
    // Rule 1: Root cluster cannot be deleted or have its parent changed
    if (clusterName === 'Root') {
      return {
        isValid: false,
        errorMessage: operation === 'delete' 
          ? 'Cannot delete the Root cluster.' 
          : 'Cannot change parent of Root cluster.',
      };
    }

    // Rule 2: Check for circular dependencies when updating parent relationships
    if (operation === 'updateParent' && newParent) {
      // Recursive function to check if setting newParent would create a circle
      const wouldCreateCircle = (childName: string, potentialParentName: string): boolean => {
        // Direct circle: child becomes parent of itself
        if (childName === potentialParentName) return true;
        
        // Find the potential parent's parent
        const parent = clusters.find(c => c.name === potentialParentName);
        if (!parent || !parent.parent) return false; // No further parent, safe
        
        // Recursively check up the hierarchy
        return wouldCreateCircle(childName, parent.parent);
      };

      if (wouldCreateCircle(clusterName, newParent)) {
        return {
          isValid: false,
          errorMessage: 'Cannot create circular dependency between clusters.',
        };
      }
    }

    // All validation checks passed
    return { isValid: true };
  }
}
