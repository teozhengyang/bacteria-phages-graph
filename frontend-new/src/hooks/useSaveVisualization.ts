import { useCallback, RefObject } from 'react';
import { saveSvgAsPng } from '../utils/visualizationUtils';

/**
 * Custom hook for saving SVG visualizations
 */
export function useSaveVisualization(
  svgRef: RefObject<SVGSVGElement | null>,
  theme: 'light' | 'dark'
) {
  const handleSave = useCallback(() => {
    if (!svgRef.current) return;
    
    saveSvgAsPng(svgRef.current, theme, 'tree-matrix.png');
  }, [svgRef, theme]);

  return { handleSave };
}
