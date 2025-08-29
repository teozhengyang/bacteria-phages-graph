/**
 * Visualization Utilities
 * 
 * This module provides essential utilities for the TreeMatrix data visualization component,
 * including theme management and SVG-to-PNG export functionality. It centralizes all
 * visualization-related styling and image generation logic.
 * 
 * Key Features:
 * - Color theme definitions for light and dark modes
 * - SVG to PNG conversion with theme-aware backgrounds
 * - Type-safe color interface definitions
 * - Browser-compatible image download functionality
 * - Canvas-based image rendering for high-quality output
 * 
 * @module visualizationUtils
 */

/**
 * Color theme interface defining all visual styling properties for the TreeMatrix
 * 
 * This interface ensures type safety and consistency across all visual elements
 * in the bacteria-phage relationship visualization.
 * 
 * @interface ColorTheme
 * @property {string} clusterCircleStroke - Border color for cluster circles
 * @property {string} bacteriaOuterFill - Fill color for bacteria outer circles
 * @property {string} bacteriaOuterStroke - Border color for bacteria outer circles
 * @property {string} bacteriaInnerFillDefault - Default fill color for bacteria inner circles
 * @property {string} clusterTextFill - Text color for cluster labels
 * @property {string} bacteriaTextFill - Text color for bacteria labels
 * @property {string} linkStroke - Color for connecting lines between elements
 * @property {string} phageCircleFillPositive - Fill color for positive phage interactions
 * @property {string} phageCircleStrokePositive - Border color for positive phage interactions
 * @property {string} phageCircleFillNegative - Fill color for negative/empty phage interactions
 * @property {string} phageCircleStrokeNegative - Border color for negative/empty phage interactions
 * @property {string} phageTextFill - Text color for phage labels
 * @property {string} svgBackground - Background color for the entire SVG canvas
 */
export interface ColorTheme {
  clusterCircleStroke: string;
  bacteriaOuterFill: string;
  bacteriaOuterStroke: string;
  bacteriaInnerFillDefault: string;
  clusterTextFill: string;
  bacteriaTextFill: string;
  linkStroke: string;
  phageCircleFillPositive: string;
  phageCircleStrokePositive: string;
  phageCircleFillNegative: string;
  phageCircleStrokeNegative: string;
  phageTextFill: string;
  svgBackground: string;
}

/**
 * Generate a complete color theme configuration based on light/dark mode preference
 * 
 * This function provides comprehensive color mapping for all visual elements in the
 * TreeMatrix visualization, ensuring proper contrast and readability in both light
 * and dark themes.
 * 
 * @param {boolean} isDark - Whether to use dark theme colors
 * @returns {ColorTheme} Complete color theme object with all styling properties
 * 
 * @example
 * ```typescript
 * const lightTheme = getColorTheme(false);
 * const darkTheme = getColorTheme(true);
 * 
 * // Use in D3.js styling
 * selection.style('fill', lightTheme.bacteriaOuterFill);
 * ```
 */
export function getColorTheme(isDark: boolean): ColorTheme {
  return {
    /* Cluster styling - for parent/group elements */
    clusterCircleStroke: isDark ? '#718096' : '#999',
    
    /* Bacteria styling - for organism nodes */
    bacteriaOuterFill: isDark ? '#2d3748' : '#eee',
    bacteriaOuterStroke: isDark ? '#4a5568' : '#999',
    bacteriaInnerFillDefault: isDark ? '#3182ce' : '#2b6cb0',
    
    /* Text styling - for all labels */
    clusterTextFill: isDark ? 'white' : 'black',
    bacteriaTextFill: isDark ? 'white' : 'black',
    phageTextFill: isDark ? 'white' : 'black',
    
    /* Connection styling - for relationship lines */
    linkStroke: isDark ? '#718096' : '#bbb',
    
    /* Phage interaction styling - for matrix elements */
    phageCircleFillPositive: isDark ? '#48bb78' : '#22c55e', // Green for positive interactions
    phageCircleStrokePositive: isDark ? '#68d391' : '#4ade80',
    phageCircleFillNegative: isDark ? '#2d3748' : '#eee', // Gray for no interaction
    phageCircleStrokeNegative: isDark ? '#4a5568' : '#999',
    
    /* Canvas styling - for export background */
    svgBackground: isDark ? '#1a202c' : 'white',
  };
}

/**
 * Convert and download an SVG element as a PNG image with theme-appropriate background
 * 
 * This function performs a complete SVG-to-PNG conversion process including:
 * 1. SVG serialization to XML string format
 * 2. Blob creation for browser compatibility
 * 3. Image loading and canvas rendering
 * 4. Theme-aware background application
 * 5. PNG generation and automatic download trigger
 * 
 * The function handles the asynchronous nature of image loading and provides
 * proper cleanup of object URLs to prevent memory leaks.
 * 
 * @param {SVGSVGElement} svgElement - The SVG DOM element to convert
 * @param {'light' | 'dark'} theme - Theme mode for background color selection
 * @param {string} [filename='tree-matrix.png'] - Desired filename for the downloaded image
 * 
 * @example
 * ```typescript
 * const svgElement = document.querySelector('svg.tree-matrix');
 * saveSvgAsPng(svgElement, 'dark', 'bacteria-phage-visualization.png');
 * ```
 */
export function saveSvgAsPng(
  svgElement: SVGSVGElement, 
  theme: 'light' | 'dark', 
  filename: string = 'tree-matrix.png'
): void {
  /* Step 1: Serialize SVG to XML string format */
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  /* Step 2: Create image element for canvas rendering */
  const img = new Image();
  
  /* Step 3: Handle image load completion */
  img.onload = () => {
    /* Create canvas with SVG dimensions */
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      /* Apply theme-appropriate background */
      ctx.fillStyle = theme === 'dark' ? '#1a202c' : 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      /* Draw SVG image onto canvas */
      ctx.drawImage(img, 0, 0);
    }
    
    /* Clean up object URL to prevent memory leaks */
    URL.revokeObjectURL(url);

    /* Step 4: Generate PNG and trigger download */
    const pngURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = pngURL;
    link.click(); /* Trigger automatic download */
  };
  
  /* Step 5: Start the conversion process */
  img.src = url;
}
