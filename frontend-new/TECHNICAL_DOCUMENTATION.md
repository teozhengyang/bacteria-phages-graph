# Bacteria-Phages Graph Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Key Components](#key-components)
4. [State Management](#state-management)
5. [File Structure](#file-structure)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Development Guidelines](#development-guidelines)
8. [API Reference](#api-reference)

## Architecture Overview

The Bacteria-Phages Graph application is a Next.js React application that visualizes bacteria-phage interactions using D3.js. The architecture follows a modular design with clear separation of concerns:

```
┌─────────────────────────────────────────────┐
│                   UI Layer                  │
│  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ FileUploader│  │     Main App Layout     │ │
│  └─────────────┘  │ ┌─────────┐ ┌─────────┐ │ │
│                   │ │Sidebar  │ │TreeMatrix│ │ │
│                   │ │Panel    │ │Visualize│ │ │
│                   │ └─────────┘ └─────────┘ │ │
│                   └─────────────────────────┘ │
├─────────────────────────────────────────────┤
│                Hooks Layer                  │
│  ┌─────────────────────────────────────────┐ │
│  │ useAppState | useTheme | useTreeViz     │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│               Services Layer                │
│  ┌─────────────────────────────────────────┐ │
│  │ DataService | ThemeService             │ │
│  └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│                Utils Layer                  │
│  ┌─────────────────────────────────────────┐ │
│  │ excelParser | sessionUtils | d3Utils   │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Core Principles
- **Single Responsibility**: Each component and service has a clear, focused purpose
- **Data Flow**: Unidirectional data flow using React hooks and state management
- **Separation of Concerns**: UI, business logic, and data processing are clearly separated
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## Data Flow

### 1. File Upload Process
```
Excel File → parseExcelFile() → DataService.handleFileUpload() → useAppState → UI Update
```

**Detailed Flow:**
1. User uploads Excel file via FileUploader component
2. `parseExcelFile()` processes the file:
   - Extracts phage names from header row
   - Converts bacteria interaction data to binary (0/1)
   - Structures data into hierarchical format
3. `DataService.handleFileUpload()` creates initial state:
   - Sets up default Root cluster
   - Assigns all bacteria to Root cluster
   - Initializes visibility settings
4. `useAppState` hook updates all relevant state
5. UI re-renders with new data

### 2. Cluster Management Flow
```
User Action → Component Event → useAppState Function → DataService Validation → State Update
```

**Example - Adding a Cluster:**
1. User clicks "Add Cluster" in CustomiserPanel
2. `AddClusterForm` triggers `addCluster()` function
3. `useAppState.addCluster()` called with cluster name
4. New cluster added to `allClusters` array
5. Cluster added to `visibleClusters` array
6. Empty bacteria order initialized in `clusterBacteriaOrder`
7. UI re-renders showing new cluster

### 3. Visualization Rendering Flow
```
State Change → buildTreeData() → useTreeVisualization → D3.js Rendering → SVG Update
```

**Detailed Process:**
1. Any state change triggers `buildTreeData()` re-computation
2. `DataService.buildTreeData()` transforms flat data into hierarchical structure
3. `useTreeVisualization` hook processes tree data for D3
4. D3.js creates/updates SVG elements with new visualization
5. User sees updated matrix with current bacteria/phage selections

### 4. Session Management Flow
```
Export: Current State → SessionData Object → JSON File Download
Import: JSON File → Parse/Validate → State Restoration → UI Update
```

## Key Components

### Core Application Components

#### `src/app/page.tsx` - Main Application Container
- **Purpose**: Orchestrates the entire application layout and component coordination
- **Key Responsibilities**:
  - Manages sidebar visibility and resizing
  - Coordinates theme management
  - Handles file upload state transitions
  - Renders main layout with proper responsive behavior

#### `src/hooks/useAppState.ts` - Central State Management
- **Purpose**: Manages all application state and business logic
- **Key State Variables**:
  - `data`: Parsed Excel file data
  - `allClusters`: All user-created clusters
  - `visibleClusters`/`visiblePhages`: Controls what's shown in visualization
  - `bacteriaClusters`: Maps bacteria to clusters
  - `clusterBacteriaOrder`: Controls bacteria display order
- **Key Functions**:
  - `handleFile()`: Process uploaded Excel files
  - `addCluster()`/`deleteCluster()`: Cluster management
  - `buildTreeData()`: Generate visualization data structure

#### `src/services/DataService.ts` - Business Logic Layer
- **Purpose**: Provides business logic and data validation
- **Key Methods**:
  - `handleFileUpload()`: Complete file processing workflow
  - `buildTreeData()`: Complex tree structure generation
  - `validateClusterOperation()`: Prevent invalid cluster operations

#### `src/components/visualization/TreeMatrix.tsx` - Main Visualization
- **Purpose**: Renders the bacteria-phage interaction matrix
- **Key Features**:
  - D3.js integration for complex visualizations
  - Interactive hover and click behaviors
  - Save/export functionality
  - Theme-aware rendering

### Utility Components

#### File Upload System
- `FileUploader.tsx`: Main upload interface
- `DropZone.tsx`: Drag-and-drop functionality
- `UploadButton.tsx`: Alternative file selection method

#### Customization Panel
- `CustomiserPanel.tsx`: Main sidebar container
- `ClusterHierarchyManager.tsx`: Cluster creation/management
- `BacteriaAssigner.tsx`: Assign bacteria to clusters
- `VisibleClustersControl.tsx`: Toggle cluster visibility

## State Management

### State Structure
```typescript
// Core data state
data: ParsedExcelData | null              // Original Excel data
allClusters: Cluster[]                    // All created clusters
visibleClusters: string[]                 // Currently visible clusters
visiblePhages: string[]                   // Currently visible phages

// Organization state
bacteriaClusters: BacteriaClusters        // Bacteria → Cluster mapping
clusterBacteriaOrder: ClusterBacteriaOrder // Bacteria order within clusters
clusterChildrenOrder: ClusterChildrenOrder // Nested cluster ordering

// UI state
hasUnsavedChanges: boolean               // Tracks modifications
originalFileName: string                 // For session export naming
```

### State Update Patterns

#### Direct State Updates
Used for simple state changes:
```typescript
setVisibleClusters(prev => [...prev, newCluster]);
```

#### Complex State Updates
Used for operations affecting multiple state variables:
```typescript
const deleteCluster = (clusterName: string) => {
  // 1. Validate operation
  // 2. Collect dependent clusters
  // 3. Update bacteria assignments
  // 4. Update cluster ordering
  // 5. Remove from cluster list
  // 6. Update visibility
};
```

### State Synchronization
- All state changes go through the `useAppState` hook
- UI components receive state via props
- Changes trigger re-renders through React's dependency system
- D3 visualizations update via `useTreeVisualization` hook

## File Structure

### Core Application Files
```
src/
├── app/
│   ├── page.tsx                    # Main application component
│   ├── layout.tsx                  # App layout and metadata
│   └── globals.css                 # Global styles
├── components/
│   ├── customizer/                 # Sidebar customization components
│   ├── file-upload/               # File upload related components
│   ├── modals/                    # Modal dialogs
│   ├── ui/                        # Reusable UI components
│   └── visualization/             # D3.js visualization components
├── hooks/                         # Custom React hooks
├── services/                      # Business logic services
├── types/                         # TypeScript type definitions
└── utils/                         # Utility functions
```

### Component Organization
```
components/
├── customizer/
│   ├── CustomiserPanel.tsx        # Main sidebar container
│   ├── AddClusterForm.tsx         # Create new clusters
│   ├── BacteriaAssigner.tsx       # Assign bacteria to clusters
│   ├── ClusterHierarchyManager.tsx # Manage cluster hierarchy
│   ├── VisibleClustersControl.tsx # Toggle cluster visibility
│   └── SessionManager.tsx         # Import/export sessions
├── file-upload/
│   ├── FileUploader.tsx           # Main upload component
│   ├── DropZone.tsx              # Drag-and-drop area
│   └── UploadButton.tsx          # File selection button
└── visualization/
    ├── TreeMatrix.tsx             # Main visualization component
    ├── TreeMatrixControls.tsx     # Visualization controls
    └── SaveControls.tsx           # Export functionality
```

## Development Guidelines

### Adding New Features

#### 1. Adding a New Cluster Operation
1. Add validation logic to `DataService.validateClusterOperation()`
2. Implement the operation in `useAppState` hook
3. Add UI controls in appropriate customizer component
4. Update TypeScript types if needed

#### 2. Adding New Visualization Elements
1. Extend `useTreeVisualization` hook with new D3 logic
2. Add any new props to `TreeMatrixProps` interface
3. Update theme handling if visual elements are theme-dependent
4. Consider save/export implications

#### 3. Adding New Data Processing
1. Create utility functions in `src/utils/`
2. Add business logic to `DataService`
3. Update type definitions in `src/types/index.ts`
4. Add error handling and validation

### Code Style Guidelines

#### TypeScript Usage
- Always define interfaces for component props
- Use strict typing - avoid `any` type
- Define utility types for complex data structures
- Use generics where appropriate for reusability

#### React Patterns
- Use custom hooks for complex logic
- Implement `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Keep components focused on presentation

#### D3.js Integration
- Always use refs for D3 DOM manipulation
- Clean up D3 elements in `useEffect` cleanup functions
- Separate D3 logic into custom hooks
- Handle React-D3 lifecycle carefully

### Testing Considerations

#### Unit Testing
- Test utility functions in isolation
- Mock external dependencies (file reading, localStorage)
- Test validation logic thoroughly
- Test edge cases in data processing

#### Integration Testing
- Test complete user workflows (upload → customize → export)
- Test state synchronization between components
- Test error handling and recovery

#### Visual Testing
- Test visualization rendering with various data sizes
- Test theme switching
- Test responsive behavior

## API Reference

### Core Hooks

#### `useAppState()`
Central state management hook for the entire application.

**Returns:**
```typescript
{
  // State
  data: ParsedExcelData | null;
  allClusters: Cluster[];
  visibleClusters: string[];
  visiblePhages: string[];
  bacteriaClusters: BacteriaClusters;
  clusterBacteriaOrder: ClusterBacteriaOrder;
  clusterChildrenOrder: ClusterChildrenOrder;
  hasUnsavedChanges: boolean;
  
  // Actions
  handleFile: (file: File) => Promise<void>;
  addCluster: (name: string, parent?: string) => void;
  deleteCluster: (name: string) => void;
  updateClusterParent: (name: string, newParent: string | null) => void;
  importSession: (file: File) => Promise<void>;
  exportSession: () => void;
  buildTreeData: () => TreeNode | null;
  getClusterInfoData: () => PhageClusterData | null;
}
```

#### `useTreeVisualization(svgRef, options)`
Manages D3.js visualization rendering and updates.

**Parameters:**
- `svgRef`: React ref to SVG element
- `options`: Visualization configuration object

#### `useTheme()`
Manages application theme state and persistence.

**Returns:**
```typescript
{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
```

### Core Services

#### `DataService`
Static class providing business logic and data processing.

**Key Methods:**
- `handleFileUpload(file: File)`: Process Excel file upload
- `buildTreeData(...)`: Generate hierarchical visualization data
- `validateClusterOperation(...)`: Validate cluster operations
- `handleSessionImport/Export(...)`: Session management

#### `ThemeService`
Singleton service for theme management with localStorage persistence.

**Methods:**
- `getInstance()`: Get singleton instance
- `getCurrentTheme()`: Get current theme
- `setTheme(theme)`: Set specific theme
- `toggleTheme()`: Switch between light/dark

### Utility Functions

#### Excel Processing
- `parseExcelFile(file: File)`: Convert Excel to application data structure
- `getFileNameWithoutExtension(filename: string)`: Extract base filename

#### Session Management
- `exportSessionData(data: SessionData, filename: string)`: Create download
- `importSessionData(file: File)`: Parse session file

#### Data Processing
- `aggregatePhageClusterInfo(treeData, headers)`: Generate cluster statistics
- Various array and object manipulation utilities

### Type Definitions

#### Core Data Types
```typescript
interface BacteriaData {
  name: string;
  values?: number[];
}

interface TreeNode {
  name: string;
  children?: TreeNode[];
  values?: number[];
  parent?: string | null;
}

interface ParsedExcelData {
  headers: string[];
  treeData: TreeData;
}
```

#### Cluster Management Types
```typescript
interface Cluster {
  name: string;
  parent: string | null;
}

interface BacteriaClusters {
  [bacteriaName: string]: string;
}

interface ClusterBacteriaOrder {
  [clusterName: string]: string[];
}
```

#### Component Props Types
- `TreeMatrixProps`: Main visualization component props
- `CustomiserPanelProps`: Sidebar panel props
- `FileUploaderProps`: File upload component props

---

## Quick Reference for Common Tasks

### Adding a New Cluster
1. User clicks "Add Cluster" in sidebar
2. `CustomiserPanel` → `AddClusterForm` → `useAppState.addCluster()`
3. State updates trigger re-render of visualization
4. New cluster appears in cluster list and visualization

### Uploading New Data
1. User selects Excel file in `FileUploader`
2. `parseExcelFile()` processes file structure
3. `DataService.handleFileUpload()` creates initial state
4. `useAppState` updates all related state
5. `TreeMatrix` renders new visualization

### Modifying Visualization
1. Changes to visibility controls update state
2. `buildTreeData()` regenerates tree structure
3. `useTreeVisualization` processes changes
4. D3.js updates SVG elements
5. Matrix reflects new configuration

### Troubleshooting Workflow
1. Check browser console for error messages
2. Verify data structure in React DevTools
3. Check state updates in `useAppState` hook
4. Validate business logic in `DataService`
5. Review D3 rendering in `useTreeVisualization`

This documentation provides a comprehensive guide to understanding, maintaining, and extending the Bacteria-Phages Graph application. For specific implementation details, refer to the inline comments within each source file.
