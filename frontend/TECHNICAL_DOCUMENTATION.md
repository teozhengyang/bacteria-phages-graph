# Bacteria-Phages Graph Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [State Management](#state-management)
4. [File Structure](#file-structure)
5. [Recent Architectural Changes](#recent-architectural-changes)

## Recent Architectural Changes

### Context-Based Refactoring
The application has been refactored from a single custom hook-based state management system to a React Context-based architecture:

#### Previous Architecture
- Single `useAppState` hook managing all application state
- Monolithic state container with complex state update patterns
- Theme management handled by separate `ThemeService` singleton

#### Current Architecture  
- **DataContext**: Manages all data-related state (clusters, visibility, sessions)
- **ThemeContext**: Handles theme state and persistence independently
- **AppContext**: Unified provider combining both contexts
- **Service Layer**: Simplified to focus on business logic only

#### Benefits of the New Architecture
- **Better Separation of Concerns**: Theme and data logic are completely separated
- **Improved Performance**: Theme changes don't trigger data-related re-renders
- **Enhanced Developer Experience**: Clear, focused hooks for specific concerns
- **Easier Testing**: Isolated contexts can be tested independently
- **Better Maintainability**: Smaller, more focused state containers

## Architecture Overview

The Bacteria-Phages Graph application is a Next.js React application that visualizes bacteria-phage interactions using D3.js. The architecture follows a modular design with React Context-based state management and clear separation of concerns:

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
│  │  useData    │ │   useTheme   │ │useTreeVisual │ │useFileUpload│ │  useSave  │ │
│  │ (Data Ctx)  │ │ (Theme Ctx)  │ │   (D3.js)    │ │(Validation) │ │(Export)   │ │
│  └─────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ └───────────┘ │
│          │               │                │               │             │        │
│          ▼               ▼                ▼               ▼             ▼        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              CONTEXTS LAYER                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐     ┌─────────────────────────────────────┐ │
│  │          DataContext            │     │         ThemeContext                │ │
│  │ ┌─────────────────────────────┐ │     │ ┌─────────────────────────────────┐ │ │
│  │ │ • Data State Management     │ │     │ │ • Theme State Management        │ │ │
│  │ │ • Cluster Operations        │ │     │ │ • Theme Persistence             │ │ │
│  │ │ • Session Management        │ │     │ │ • Theme Toggle Functionality    │ │ │
│  │ │ • Visibility Controls       │ │     │ │ • Context-based State           │ │ │
│  │ └─────────────────────────────┘ │     │ └─────────────────────────────────┘ │ │
│  └─────────────────────────────────┘     └─────────────────────────────────────┘ │
│                    │                                       │                     │
│                    ▼                                       ▼                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                              SERVICES LAYER                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                     ┌─────────────────────────────────┐                          │
│                     │          DataService            │                          │
│                     │ ┌─────────────────────────────┐ │                          │
│                     │ │ • File Processing           │ │                          │
│                     │ │ • Tree Data Generation      │ │                          │
│                     │ │ • Cluster Validation        │ │                          │
│                     │ │ • Session Management        │ │                          │
│                     │ └─────────────────────────────┘ │                          │
│                     └─────────────────────────────────┘                          │
│                                   │                                              │
│                                   ▼                                              │
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
                            │    │  Context State  │    │        Visualization
    User Interactions ─────►│    │ (Data & Theme)  │    │──────► UI Re-renders
                            │    └─────────────────┘    │
    Theme Changes ─────────►│                           │──────► CSS Updates
                            └───────────────────────────┘
```

### Architectural Layers

#### UI Layer
- **Components**: React components for user interface and interaction
- **Layout**: Responsive layout with resizable sidebar and main visualization area
- **Theme Support**: Dark/light mode with system preference detection

#### Contexts Layer
- **State Management**: React Context providers for centralized state management
- **Data Operations**: Business logic integration through context methods
- **Theme Management**: Persistent theme state with localStorage integration

#### Hooks Layer
- **State Management**: Custom hooks for managing application state and business logic
- **Side Effects**: Hooks for file operations, visualization rendering, and theme management
- **Data Processing**: Hooks for complex data transformations and D3.js integration

#### Services Layer
- **Business Logic**: Core application logic and data validation (used by DataContext)
- **Data Processing**: Excel file parsing and tree structure generation
- **Theme Management**: Handled directly by ThemeContext (no separate service layer)

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
3. **State Initialization**: `DataContext.handleFile()` creates initial application state:
   - Sets up default "Root" cluster containing all bacteria
   - Initializes visibility settings for clusters and phages
   - Establishes bacteria-to-cluster mappings
4. **State Update**: Context state propagates changes throughout the application
5. **UI Rendering**: Components re-render with new data and visualization

### 2. Cluster Management Flow
```
User Action → Component Event → DataContext Method → DataService Validation → State Update → UI Refresh
```

**Operations:**
- **Add Cluster**: User creates new cluster → validation → context state update → UI refresh
- **Delete Cluster**: User removes cluster → dependency check → bacteria reassignment → context state update
- **Modify Hierarchy**: User changes cluster parent → validation → reordering → context state update
- **Assign Bacteria**: User moves bacteria between clusters → validation → mapping update

### 3. Visualization Rendering Flow
```
State Change → buildTreeData() → useTreeVisualization → D3.js Processing → SVG Rendering
```

**Process:**
1. **Data Preparation**: Any context state change triggers `buildTreeData()` recalculation
2. **Tree Structure**: `DataService.buildTreeData()` transforms flat cluster data into hierarchical tree
3. **D3 Integration**: `useTreeVisualization` hook processes tree data for D3.js consumption
4. **Rendering**: D3.js creates/updates SVG elements with interactive matrix visualization
5. **User Interaction**: Hover effects, click handlers, and visual feedback

### 4. Session Management Flow
```
Export: Context State → SessionData Object → JSON File Download
Import: JSON File Upload → Parse/Validate → Context State Restoration → UI Synchronization
```

### 5. Theme Management Flow
```
User Toggle → ThemeContext.toggleTheme → localStorage Update → Theme State Change → UI Re-render
```

## State Management

### State Architecture
The application uses React Context API for centralized state management, with separate contexts for different concerns providing clean separation and optimal performance.

### Core State Structure

#### DataContext State
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
showSidebar: boolean                     // Controls sidebar visibility
```

#### ThemeContext State
```typescript
// Theme State
theme: 'light' | 'dark'                 // Current theme setting
```

### State Update Patterns

#### Simple State Updates
Direct context state modifications for straightforward changes:
```typescript
// Toggle phage visibility in DataContext
setVisiblePhages(prev => 
  prev.includes(phageName) 
    ? prev.filter(p => p !== phageName)
    : [...prev, phageName]
);

// Toggle theme in ThemeContext
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  setTheme(newTheme);
};
```

#### Complex State Operations
Multi-step context state updates for operations affecting multiple state variables:
```typescript
const deleteCluster = (clusterName: string) => {
  // 1. Validate operation (prevent deletion of Root cluster)
  // 2. Identify dependent child clusters
  // 3. Reassign bacteria to parent cluster
  // 4. Update cluster hierarchy ordering
  // 5. Remove cluster from all relevant context state arrays
  // 6. Update visibility arrays
  // 7. Mark as having unsaved changes
};
```

### State Synchronization
- **Context Architecture**: State changes flow through separate DataContext and ThemeContext providers
- **Component Access**: UI components access context state via `useData` and `useTheme` hooks
- **React Reactivity**: Context state changes trigger automatic re-renders via React's dependency system
- **D3 Integration**: Visualization updates via `useTreeVisualization` hook responding to DataContext changes
- **Performance**: Separate contexts prevent unnecessary re-renders (theme changes don't affect data components)

### Data Persistence
- **Session Export**: Complete DataContext state serialized to JSON file
- **Session Import**: JSON file parsed and validated before DataContext state restoration
- **Theme Persistence**: User theme preference stored in localStorage via ThemeContext
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

### Context Directory (`src/context/`)
**React Context providers for centralized state management**

- **`AppContext.tsx`** - Unified context provider combining all application contexts (DataContext + ThemeContext)
- **`DataContext.tsx`** - Data state management context providing data operations, cluster management, and session functionality
- **`ThemeContext.tsx`** - Theme management context handling light/dark mode switching and persistence
- **`index.ts`** - Barrel export for context providers and hooks

### Hooks Directory (`src/hooks/`)
**Custom React hooks for state management and side effects**

- **`useBeforeUnload.ts`** - Hook for warning users about unsaved changes before page navigation
- **`useFileUpload.ts`** - Hook handling file upload processing and validation
- **`useResizableSidebar.ts`** - Hook managing sidebar resizing and responsive behavior
- **`useSaveVisualization.ts`** - Hook for exporting visualizations and data
- **`useTreeVisualization.ts`** - Hook managing D3.js visualization rendering and updates

### Services Directory (`src/services/`)
**Business logic services and external integrations**

- **`dataService.ts`** - Core business logic for data processing, validation, and tree structure generation (used by DataContext)

### Types Directory (`src/types/`)
**TypeScript type definitions and interfaces**

- **`index.ts`** - Comprehensive type definitions for:
  - Data structures (BacteriaData, TreeNode, ParsedExcelData)
  - Cluster management (Cluster, BacteriaClusters, ClusterBacteriaOrder)
  - Component props (TreeMatrixProps, CustomiserPanelProps)
  - Session management (SessionData, SessionExportData)
  - Context interfaces (DataContextValue, ThemeContextValue)
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