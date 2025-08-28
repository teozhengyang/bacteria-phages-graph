# Frontend Architecture Documentation

## Project Structure

The frontend has been refactored into a clean, modular architecture that follows React best practices and separates concerns effectively.

```
src/
├── app/                     # Next.js app router
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main page component (simplified)
├── components/             # All React components organized by feature
│   ├── ui/                 # Generic, reusable UI components
│   │   ├── ThemeToggle.tsx # Theme switching component
│   │   ├── LoadingSpinner.tsx # Loading spinner component
│   │   └── index.ts        # Component exports
│   ├── file-upload/        # File upload related components
│   │   ├── FileUploader.tsx # Main file upload interface
│   │   ├── DropZone.tsx    # Drag & drop zone component
│   │   ├── UploadButton.tsx # Upload button with progress
│   │   └── index.ts        # Component exports
│   ├── visualization/      # Data visualization components
│   │   ├── TreeMatrix.tsx  # Main tree matrix visualization
│   │   ├── SaveControls.tsx # Save/export controls
│   │   └── index.ts        # Component exports
│   ├── customizer/         # Data customization panel components
│   │   ├── CustomiserPanel.tsx      # Main customizer panel
│   │   ├── VisibleClustersControl.tsx # Cluster visibility controls
│   │   ├── AddClusterForm.tsx       # Add new cluster form
│   │   ├── ClusterParentManager.tsx # Manage cluster hierarchy
│   │   ├── ClusterHierarchyManager.tsx # Manage cluster order
│   │   ├── BacteriaAssigner.tsx     # Assign bacteria to clusters
│   │   ├── VisiblePhagesControl.tsx # Phage visibility controls
│   │   ├── SessionManager.tsx       # Import/export session data
│   │   └── index.ts        # Component exports
│   └── modals/             # Modal dialog components
│       ├── PhageClusterInfoModal.tsx # Phage cluster information modal
│       └── index.ts        # Component exports
├── hooks/                  # Custom React hooks
│   ├── useAppState.ts      # Main application state management
│   ├── useTheme.ts         # Theme management hook
│   ├── useResizableSidebar.ts # Sidebar resizing logic
│   ├── useBeforeUnload.ts  # Unsaved changes warning
│   └── useFileUpload.ts    # File upload state management
├── services/               # Business logic services
│   ├── dataService.ts      # Data processing and validation
│   └── themeService.ts     # Theme management service
├── utils/                  # Utility functions
│   ├── excelParser.ts      # Excel file parsing
│   ├── aggregatePhageClusterInfo.ts # Data aggregation
│   ├── sessionUtils.ts     # Session import/export
│   ├── arrayUtils.ts       # Array manipulation utilities
│   └── fileUtils.ts        # File handling utilities
├── types/                  # TypeScript type definitions
│   └── index.ts           # All type exports
└── constants/              # Application constants
    └── index.ts           # Colors, UI constants, etc.
```

## Key Improvements

### 1. Component Organization
- **Feature-based structure**: Components are grouped by functionality rather than type
- **Single responsibility**: Each component has a focused, specific purpose
- **Reusable UI components**: Generic components can be used across features
- **Clear boundaries**: Separation between presentation and business logic

### 2. State Management
- **Centralized application state**: `useAppState` hook manages all application state
- **Service layer**: Business logic extracted to `DataService`
- **Validation logic**: Input validation and error handling centralized
- **Computed values**: Tree building and data aggregation handled by services

### 3. Business Logic Separation
- **DataService**: Handles file processing, session management, and data validation
- **Custom hooks**: Encapsulate complex state logic and side effects
- **Utility functions**: Pure functions for data transformation and manipulation

### 4. Type Safety
- **Comprehensive types**: All data structures properly typed
- **Interface segregation**: Specific prop interfaces for each component
- **Type exports**: Centralized type definitions with clear exports

### 5. Code Organization
- **Index files**: Clean imports using barrel exports
- **Consistent naming**: Clear, descriptive component and file names
- **Logical grouping**: Related functionality kept together

## Component Breakdown

### File Upload Components
- `FileUploader`: Main upload interface with theme integration
- `DropZone`: Handles drag & drop functionality with visual feedback
- `UploadButton`: Upload button with loading states and progress indication

### Visualization Components
- `TreeMatrix`: Complex D3.js visualization with optimized rendering
- `SaveControls`: Simple controls for saving visualization as PNG

### Customizer Components
- `CustomiserPanel`: Main container that orchestrates all customization features
- `VisibleClustersControl`: Toggle cluster visibility with delete functionality
- `AddClusterForm`: Form for creating new clusters with parent selection
- `ClusterParentManager`: Interface for changing cluster parent relationships
- `ClusterHierarchyManager`: Drag-and-drop style ordering for clusters and bacteria
- `BacteriaAssigner`: Dropdown interface for assigning bacteria to clusters
- `VisiblePhagesControl`: Checkbox interface for phage visibility
- `SessionManager`: Import/export functionality for saving work

### UI Components
- `ThemeToggle`: Reusable theme switching component
- `LoadingSpinner`: Configurable loading indicator

### Modal Components
- `PhageClusterInfoModal`: Complex modal for exploring phage-cluster relationships

## Benefits of This Architecture

1. **Maintainability**: Smaller, focused components are easier to maintain and debug
2. **Testability**: Individual components can be tested in isolation
3. **Reusability**: UI components can be reused across different features
4. **Scalability**: Easy to add new features without affecting existing code
5. **Performance**: Smaller components enable better tree-shaking and lazy loading
6. **Developer Experience**: Clear structure makes it easy for new developers to understand
7. **Code Splitting**: Different features can be lazy-loaded as needed

## Migration Guide

The refactoring maintains 100% functional compatibility with the original implementation:

- All existing features work exactly as before
- State management logic is preserved
- Event handlers and user interactions remain unchanged
- Visual appearance and behavior are identical
- File upload, session management, and visualization features are unaffected

The main differences are internal organization and code structure, which provide a much better foundation for future development and maintenance.

## Future Enhancements

This architecture makes it easy to implement additional features:

- Add new visualization types by extending the `visualization/` folder
- Implement additional file formats by extending the `file-upload/` components
- Add new customization options by creating new components in `customizer/`
- Integrate additional UI components in the `ui/` folder
- Add new data processing features in the `services/` layer
