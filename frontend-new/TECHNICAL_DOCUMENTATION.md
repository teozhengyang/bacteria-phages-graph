# Bacteria-Phages Graph Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [State Management](#state-management)
4. [File Structure](#file-structure)

## Architecture Overview

The Bacteria-Phages Graph application is a Next.js React application that visualizes bacteria-phage interactions using D3.js. The architecture follows a modular design with clear separation of concerns:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 UI LAYER                                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────────────────────────────┐  │
│  │    File Upload      │  │                Main Layout                        │  │
│  │  ┌───────────────┐  │  │  ┌─────────────────────┐ ┌─────────────────────┐  │  │
│  │  │  DropZone     │  │  │  │   Sidebar Panel     │ │   Visualization     │  │  │
│  │  ├───────────────┤  │  │  │ ┌─────────────────┐ │ │ ┌─────────────────┐ │  │  │
│  │  │ UploadButton  │  │  │  │ │ ClusterManager  │ │ │ │   TreeMatrix    │ │  │  │
│  │  └───────────────┘  │  │  │ ├─────────────────┤ │ │ │    (D3.js)      │ │  │  │
│  └─────────────────────┘  │  │ │ BacteriaAssigner│ │ │ ├─────────────────┤ │  │  │
│                           │  │ ├─────────────────┤ │ │ │ SaveControls    │ │  │  │
│  ┌─────────────────────┐  │  │ │ VisibilityCtrl  │ │ │ └─────────────────┘ │  │  │
│  │      Modals         │  │  │ ├─────────────────┤ │ └─────────────────────┘  │  │
│  │ ┌─────────────────┐ │  │  │ │ SessionManager  │ │                          │  │
│  │ │ PhageClusterInfo│ │  │  │ ├─────────────────┤ │                          │  │
│  │ │     Modal       │ │  │  │ │   ThemeToggle   │ │                          │  │ 
│  │ └─────────────────┘ │  │  │ └─────────────────┘ │                          │  │
│  └─────────────────────┘  │  └─────────────────────┘                          │  │
│                           └───────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                HOOKS LAYER                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ useAppState │ │   useTheme   │ │useTreeVisual │ │useFileUpload│ │  useSave  │ │
│  │   (Core)    │ │ (Theming)    │ │   (D3.js)    │ │(Validation) │ │(Export)   │ │
│  └─────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ └───────────┘ │
│          │               │                │               │             │        │
│          ▼               ▼                ▼               ▼             ▼        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              SERVICES LAYER                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐     ┌─────────────────────────────────────┐ │
│  │          DataService            │     │         ThemeService                │ │
│  │ ┌─────────────────────────────┐ │     │ ┌─────────────────────────────────┐ │ │
│  │ │ • File Processing           │ │     │ │ • Theme Persistence             │ │ │
│  │ │ • Tree Data Generation      │ │     │ │ • localStorage Integration      │ │ │
│  │ │ • Cluster Validation        │ │     │ │ • System Theme Detection        │ │ │
│  │ │ • Session Management        │ │     │ └─────────────────────────────────┘ │ │
│  │ └─────────────────────────────┘ │     └─────────────────────────────────────┘ │
│  └─────────────────────────────────┘                                             │
│                    │                                                             │
│                    ▼                                                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                UTILS LAYER                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │excelParser  │ │sessionUtils │ │treeCalc     │ │arrayUtils   │ │fileUtils    │ │
│  │(File I/O)   │ │(Import/     │ │(D3 Data     │ │(Processing) │ │(Validation) │ │
│  │             │ │ Export)     │ │ Prep)       │ │             │ │             │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │              visualizationUtils & aggregatePhageClusterInfo                 │ │
│  │                    (D3.js Helpers & Statistical Analysis)                   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘

                            ┌─── Data Flow Direction ───┐
                            │                           │
    Excel File Input ──────►│    ┌─────────────────┐    │──────► D3.js SVG
                            │    │  State Updates  │    │        Visualization
    User Interactions ─────►│    │  (useAppState)  │    │──────► UI Re-renders
                            │    └─────────────────┘    │
    Theme Changes ─────────►│                           │──────► CSS Updates
                            └───────────────────────────┘
```

### Architectural Layers

#### UI Layer
- **Components**: React components for user interface and interaction
- **Layout**: Responsive layout with resizable sidebar and main visualization area
- **Theme Support**: Dark/light mode with system preference detection

#### Hooks Layer
- **State Management**: Custom hooks for managing application state and business logic
- **Side Effects**: Hooks for file operations, visualization rendering, and theme management
- **Data Processing**: Hooks for complex data transformations and D3.js integration

#### Services Layer
- **Business Logic**: Core application logic and data validation
- **Data Processing**: Excel file parsing and tree structure generation
- **Persistence**: Theme preferences and session data management

#### Utils Layer
- **Utility Functions**: Pure functions for data manipulation and processing
- **File Operations**: Excel parsing, session import/export
- **Data Transformations**: Array operations, tree calculations, visualization utilities

## Data Flow

### 1. File Upload and Processing Flow
```
Excel File → parseExcelFile() → DataService.handleFileUpload() → useAppState → UI Update
```

**Process:**
1. **File Selection**: User uploads Excel file via `FileUploader` component
2. **Parsing**: `parseExcelFile()` utility processes the file:
   - Extracts phage names from header row
   - Converts bacteria interaction data to binary matrix (0/1)
   - Structures data into hierarchical format for visualization
3. **State Initialization**: `DataService.handleFileUpload()` creates initial application state:
   - Sets up default "Root" cluster containing all bacteria
   - Initializes visibility settings for clusters and phages
   - Establishes bacteria-to-cluster mappings
4. **State Update**: `useAppState` hook propagates changes throughout the application
5. **UI Rendering**: Components re-render with new data and visualization

### 2. Cluster Management Flow
```
User Action → Component Event → useAppState Function → DataService Validation → State Update → UI Refresh
```

**Operations:**
- **Add Cluster**: User creates new cluster → validation → state update → UI refresh
- **Delete Cluster**: User removes cluster → dependency check → bacteria reassignment → state update
- **Modify Hierarchy**: User changes cluster parent → validation → reordering → state update
- **Assign Bacteria**: User moves bacteria between clusters → validation → mapping update

### 3. Visualization Rendering Flow
```
State Change → buildTreeData() → useTreeVisualization → D3.js Processing → SVG Rendering
```

**Process:**
1. **Data Preparation**: Any state change triggers `buildTreeData()` recalculation
2. **Tree Structure**: `DataService.buildTreeData()` transforms flat cluster data into hierarchical tree
3. **D3 Integration**: `useTreeVisualization` hook processes tree data for D3.js consumption
4. **Rendering**: D3.js creates/updates SVG elements with interactive matrix visualization
5. **User Interaction**: Hover effects, click handlers, and visual feedback

### 4. Session Management Flow
```
Export: App State → SessionData Object → JSON File Download
Import: JSON File Upload → Parse/Validate → State Restoration → UI Synchronization
```

## State Management

### State Architecture
The application uses a centralized state management approach through the `useAppState` hook, providing a single source of truth for all application data.

### Core State Structure
```typescript
// Data State
data: ParsedExcelData | null              // Original Excel file data
allClusters: Cluster[]                    // All user-created clusters
visibleClusters: string[]                 // Currently visible clusters in visualization
visiblePhages: string[]                   // Currently visible phages in visualization

// Organization State
bacteriaClusters: BacteriaClusters        // Maps bacteria names to cluster assignments
clusterBacteriaOrder: ClusterBacteriaOrder // Controls bacteria display order within clusters
clusterChildrenOrder: ClusterChildrenOrder // Controls nested cluster hierarchy order

// UI State
hasUnsavedChanges: boolean               // Tracks if user has unsaved modifications
originalFileName: string                 // Original uploaded file name for session exports
```

### State Update Patterns

#### Simple State Updates
Direct state modifications for straightforward changes:
```typescript
// Toggle phage visibility
setVisiblePhages(prev => 
  prev.includes(phageName) 
    ? prev.filter(p => p !== phageName)
    : [...prev, phageName]
);
```

#### Complex State Operations
Multi-step state updates for operations affecting multiple state variables:
```typescript
const deleteCluster = (clusterName: string) => {
  // 1. Validate operation (prevent deletion of Root cluster)
  // 2. Identify dependent child clusters
  // 3. Reassign bacteria to parent cluster
  // 4. Update cluster hierarchy ordering
  // 5. Remove cluster from all relevant state arrays
  // 6. Update visibility arrays
  // 7. Mark as having unsaved changes
};
```

### State Synchronization
- **Central Hub**: All state changes flow through `useAppState` hook
- **Component Props**: UI components receive state via props (unidirectional data flow)
- **React Reactivity**: State changes trigger automatic re-renders via React's dependency system
- **D3 Integration**: Visualization updates via `useTreeVisualization` hook responding to state changes

### Data Persistence
- **Session Export**: Complete application state serialized to JSON file
- **Session Import**: JSON file parsed and validated before state restoration
- **Theme Persistence**: User theme preference stored in localStorage
- **Unsaved Changes**: Track modifications to warn users before navigation

## File Structure

### Application Root
```
src/
├── app/                           # Next.js App Router structure
├── components/                    # React UI components organized by feature
├── constants/                     # Application constants and configuration
├── hooks/                         # Custom React hooks for state and logic
├── services/                      # Business logic and external services
├── types/                         # TypeScript type definitions
└── utils/                         # Pure utility functions and helpers
```

### App Directory (`src/app/`)
**Next.js App Router files for application structure and metadata**

- **`layout.tsx`** - Root layout component providing global HTML structure, metadata, and theme provider setup
- **`page.tsx`** - Main application page component orchestrating the entire UI layout and state coordination
- **`globals.css`** - Global CSS styles including Tailwind directives and custom global styles
- **`favicon.ico`** - Application favicon

### Components Directory (`src/components/`)

#### File Upload (`src/components/file-upload/`)
**Components for handling Excel file uploads and processing**

- **`FileUploader.tsx`** - Main file upload component coordinating drag-and-drop and button upload methods
- **`DropZone.tsx`** - Drag-and-drop area with visual feedback for file uploads
- **`UploadButton.tsx`** - Traditional file selection button with file validation
- **`index.ts`** - Barrel export for file upload components

#### Customization Panel (`src/components/customizer/`)
**Sidebar components for data manipulation and visualization control**

- **`CustomiserPanel.tsx`** - Main sidebar container organizing all customization controls
- **`AddClusterForm.tsx`** - Form component for creating new bacteria clusters
- **`BacteriaAssigner.tsx`** - Interface for assigning bacteria to different clusters
- **`ClusterHierarchyManager.tsx`** - Component for managing cluster creation and deletion
- **`ClusterParentManager.tsx`** - Interface for modifying cluster parent-child relationships
- **`SessionManager.tsx`** - Session import/export controls for saving and loading configurations
- **`VisibleClustersControl.tsx`** - Toggle controls for cluster visibility in visualization
- **`VisiblePhagesControl.tsx`** - Toggle controls for phage visibility in visualization
- **`index.ts`** - Barrel export for customizer components

#### Visualization (`src/components/visualization/`)
**Components for D3.js-based data visualization and interaction**

- **`TreeMatrix.tsx`** - Main visualization component rendering bacteria-phage interaction matrix using D3.js
- **`TreeMatrixControls.tsx`** - Control panel for visualization settings and options
- **`SaveControls.tsx`** - Interface for exporting visualizations as images or data files
- **`index.ts`** - Barrel export for visualization components

#### Modals (`src/components/modals/`)
**Modal dialog components for detailed information display**

- **`PhageClusterInfoModal.tsx`** - Modal displaying detailed statistics and information about phage clusters
- **`index.ts`** - Barrel export for modal components

#### UI Components (`src/components/ui/`)
**Reusable UI components and utilities**

- **`LoadingSpinner.tsx`** - Loading indicator component with animation
- **`ThemeToggle.tsx`** - Toggle component for switching between light and dark themes
- **`index.ts`** - Barrel export for UI components

### Hooks Directory (`src/hooks/`)
**Custom React hooks for state management and side effects**

- **`useAppState.ts`** - Central state management hook containing all application state and business logic
- **`useTheme.ts`** - Hook for theme management with localStorage persistence
- **`useTreeVisualization.ts`** - Hook managing D3.js visualization rendering and updates
- **`useFileUpload.ts`** - Hook handling file upload processing and validation
- **`useSaveVisualization.ts`** - Hook for exporting visualizations and data
- **`useResizableSidebar.ts`** - Hook managing sidebar resizing and responsive behavior
- **`useBeforeUnload.ts`** - Hook for warning users about unsaved changes before page navigation

### Services Directory (`src/services/`)
**Business logic services and external integrations**

- **`dataService.ts`** - Core business logic for data processing, validation, and tree structure generation
- **`themeService.ts`** - Singleton service for theme management with localStorage integration

### Types Directory (`src/types/`)
**TypeScript type definitions and interfaces**

- **`index.ts`** - Comprehensive type definitions for:
  - Data structures (BacteriaData, TreeNode, ParsedExcelData)
  - Cluster management (Cluster, BacteriaClusters, ClusterBacteriaOrder)
  - Component props (TreeMatrixProps, CustomiserPanelProps)
  - Session management (SessionData, SessionExportData)
  - UI state types and utility types

### Utils Directory (`src/utils/`)
**Pure utility functions and data processing helpers**

- **`excelParser.ts`** - Functions for parsing Excel files and converting to application data format
- **`aggregatePhageClusterInfo.ts`** - Utility for calculating cluster statistics and phage interaction summaries
- **`sessionUtils.ts`** - Functions for session data serialization, export, and import validation
- **`treeCalculations.ts`** - Pure functions for tree structure calculations and transformations
- **`visualizationUtils.ts`** - Helper functions for D3.js visualization setup and data formatting
- **`arrayUtils.ts`** - General array manipulation and processing utilities
- **`fileUtils.ts`** - File handling utilities including filename processing and validation

### Constants Directory (`src/constants/`)
**Application configuration and constant values**

- **`index.ts`** - Application constants including:
  - Default cluster names and settings
  - Visualization configuration parameters
  - Theme-related constants
  - File processing limits and validation rules

---