/**
 * useSaveVisualization Hook
 * 
 * A custom React hook that provides functionality for saving SVG-based visualizations
 * as PNG images. This hook encapsulates the logic for converting D3.js-generated SVG
 * elements into downloadable image files.
 * 
 * Features:
 * - SVG to PNG conversion with theme awareness
 * - Ref-based SVG element access for direct manipulation
 * - Memoized callback for performance optimization
 * - Consistent file naming convention
 * - Theme-aware rendering for proper color scheme preservation
 * 
 * Technical Implementation:
 * - Uses useCallback to prevent unnecessary re-renders
 * - Integrates with visualization utility functions
 * - Provides null-safe operations for SVG reference
 * - Supports both light and dark theme exports
 * 
 * @param {RefObject<SVGSVGElement | null>} svgRef - React ref pointing to the SVG element to save
 * @param {'light' | 'dark'} theme - Current theme mode for proper rendering context
 * @returns {Object} Hook interface with save functionality
 * @returns {Function} returns.handleSave - Callback function to trigger the save operation
 * 
 * @example
 * ```typescript
 * const svgRef = useRef<SVGSVGElement>(null);
 * const { handleSave } = useSaveVisualization(svgRef, 'dark');
 * 
 * // Use in component
 * <button onClick={handleSave}>Save as PNG</button>
 * <svg ref={svgRef}>...</svg>
 * ```
 */

import { useCallback, RefObject } from 'react';
import { saveSvgAsPng } from '../utils/visualizationUtils';

/**
 * Custom hook for saving SVG visualizations as PNG images
 * 
 * This hook provides a clean interface for converting SVG-based data visualizations
 * into downloadable PNG files while preserving theme-specific styling.
 */
export function useSaveVisualization(
  svgRef: RefObject<SVGSVGElement | null>,
  theme: 'light' | 'dark'
) {
  /**
   * Memoized callback function to handle the save operation
   * 
   * This function safely checks for SVG element existence and delegates
   * the actual conversion process to the visualization utilities.
   * 
   * @function handleSave
   * @memberof useSaveVisualization
   */
  const handleSave = useCallback(() => {
    /* Early return if SVG element is not available */
    if (!svgRef.current) return;
    
    /* Delegate to utility function with theme and filename parameters */
    saveSvgAsPng(svgRef.current, theme, 'tree-matrix.png');
  }, [svgRef, theme]);

  /* Return interface object with save functionality */
  return { handleSave };
}
