# Bacteria-Phages Graph Visualization Frontend

A modern React/Next.js application for visualizing bacteria-phage interaction data with interactive matrix visualizations, hierarchical clustering, and comprehensive data management tools.

## Features

### 🧬 Data Visualization
- **Interactive Matrix View**: D3.js-powered visualization of bacteria-phage interactions
- **Hierarchical Clustering**: Custom cluster creation and management
- **Dynamic Filtering**: Real-time visibility controls for clusters and phages
- **Responsive Design**: Optimized for different screen sizes

### 📊 Data Management
- **Excel File Import**: Support for `.xlsx` and `.xls` files
- **Session Management**: Save and restore custom configurations
- **Data Validation**: Automatic file format and content validation
- **Bacteria Organization**: Drag-and-drop bacteria assignment to clusters

### 🎨 User Experience
- **Modern Interface**: Clean, intuitive design with glassmorphism effects
- **Dark/Light Theme**: Automatic theme switching with persistence
- **Resizable Panels**: Customizable sidebar width
- **Progress Indicators**: Visual feedback for file uploads and processing

### 🏗️ Architecture
- **Context-Based State Management**: Centralized state without prop drilling
- **TypeScript**: Full type safety and excellent developer experience
- **Modular Components**: Clean component architecture with clear separation of concerns
- **Performance Optimized**: Dynamic imports and efficient rendering

## Tech Stack

- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0 + DaisyUI
- **Visualization**: D3.js 7.9.0
- **State Management**: React Context + Custom Hooks
- **File Processing**: XLSX.js for Excel file parsing
- **Icons**: Lucide React
- **Notifications**: React Toastify

## Project Structure

```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Main application page
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── customizer/          # Sidebar customization components
│   │   ├── CustomiserPanel.tsx
│   │   ├── AddClusterForm.tsx
│   │   ├── BacteriaAssigner.tsx
│   │   ├── ClusterHierarchyManager.tsx
│   │   ├── ClusterParentManager.tsx
│   │   ├── SessionManager.tsx
│   │   ├── VisibleClustersControl.tsx
│   │   ├── VisiblePhagesControl.tsx
│   │   └── index.ts
│   ├── file-upload/         # File upload functionality
│   │   ├── FileUploader.tsx
│   │   ├── DropZone.tsx
│   │   ├── UploadButton.tsx
│   │   └── index.ts
│   ├── visualization/       # D3.js visualizations
│   │   ├── TreeMatrix.tsx
│   │   ├── TreeMatrixControls.tsx
│   │   ├── SaveControls.tsx
│   │   └── index.ts
│   ├── modals/              # Modal components
│   │   ├── PhageClusterInfoModal.tsx
│   │   └── index.ts
│   └── ui/                  # Reusable UI components
│       ├── LoadingSpinner.tsx
│       ├── ThemeToggle.tsx
│       └── index.ts
├── context/                 # Global state management
│   ├── AppContext.tsx       # Main application context
│   └── index.ts
├── hooks/                   # Custom React hooks
│   ├── useBeforeUnload.ts   # Prevent data loss
│   ├── useFileUpload.ts     # File upload state
│   ├── useResizableSidebar.ts
│   ├── useSaveVisualization.ts
│   └── useTreeVisualization.ts
├── services/                # Business logic
│   └── dataService.ts       # Data processing service
├── types/                   # TypeScript definitions
│   └── index.ts             # All type definitions
├── utils/                   # Utility functions
│   ├── aggregatePhageClusterInfo.ts
│   ├── arrayUtils.ts
│   ├── excelParser.ts
│   ├── fileUtils.ts
│   ├── sessionUtils.ts
│   ├── treeCalculations.ts
│   └── visualizationUtils.ts
└── constants/               # Application constants
    └── index.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bacteria-phages-graph/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Usage

### 1. Upload Data
- Drag and drop an Excel file or click to browse
- Supported formats: `.xlsx`, `.xls`
- First row should contain phage names
- First column should contain bacteria names

### 2. Create Clusters
- Use the sidebar to create custom bacteria clusters
- Assign bacteria to clusters via drag-and-drop interface
- Organize clusters hierarchically with parent-child relationships

### 3. Customize Visualization
- Control cluster and phage visibility
- Reorder bacteria within clusters
- Adjust cluster hierarchy
- Toggle between light and dark themes

### 4. Save Sessions
- Export current configuration as JSON
- Import previously saved sessions
- Maintain custom cluster arrangements and visibility settings

## Architecture Details

### State Management
The application uses React Context for centralized state management, eliminating prop drilling and providing a clean data flow:

- **AppContext**: Central state container for all application data
- **useAppContext**: Hook for accessing state and actions
- **Type Safety**: Full TypeScript integration for compile-time error checking

### Component Organization
Components are organized by functionality with clear separation of concerns:

- **Presentation Components**: Focus on UI rendering
- **Container Components**: Handle business logic and state
- **Utility Components**: Reusable UI elements
- **Service Layer**: Data processing and business rules

### Performance Optimizations
- **Dynamic Imports**: Components loaded on-demand
- **Efficient Re-renders**: Context optimization prevents unnecessary updates
- **Memory Management**: Proper cleanup of D3.js resources

## Development Guidelines

### Adding New Features
1. Define types in `src/types/index.ts`
2. Add state to `AppContext` if needed
3. Create focused, single-responsibility components
4. Use the `useAppContext` hook to access state
5. Document components with JSDoc comments

### Code Style
- **TypeScript**: Strong typing for all components and functions
- **ESLint**: Consistent code formatting and best practices
- **Comments**: Comprehensive documentation for complex logic
- **Testing**: Unit tests for critical business logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with proper documentation
4. Add tests for new functionality
5. Submit a pull request

## License

[License information here]

## Support

For questions or issues, please [create an issue](link-to-issues) or contact the development team.
