/**
 * Color theme utilities for TreeMatrix visualization
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
 * Get color theme based on light/dark mode
 */
export function getColorTheme(isDark: boolean): ColorTheme {
  return {
    clusterCircleStroke: isDark ? '#718096' : '#999',
    bacteriaOuterFill: isDark ? '#2d3748' : '#eee',
    bacteriaOuterStroke: isDark ? '#4a5568' : '#999',
    bacteriaInnerFillDefault: isDark ? '#3182ce' : '#2b6cb0',
    clusterTextFill: isDark ? 'white' : 'black',
    bacteriaTextFill: isDark ? 'white' : 'black',
    linkStroke: isDark ? '#718096' : '#bbb',
    phageCircleFillPositive: isDark ? '#48bb78' : '#22c55e',
    phageCircleStrokePositive: isDark ? '#68d391' : '#4ade80',
    phageCircleFillNegative: isDark ? '#2d3748' : '#eee',
    phageCircleStrokeNegative: isDark ? '#4a5568' : '#999',
    phageTextFill: isDark ? 'white' : 'black',
    svgBackground: isDark ? '#1a202c' : 'white',
  };
}

/**
 * Save SVG as PNG image
 */
export function saveSvgAsPng(
  svgElement: SVGSVGElement, 
  theme: 'light' | 'dark', 
  filename: string = 'tree-matrix.png'
): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = svgElement.clientWidth;
    canvas.height = svgElement.clientHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = theme === 'dark' ? '#1a202c' : 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
    
    URL.revokeObjectURL(url);

    const pngURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = pngURL;
    link.click();
  };
  
  img.src = url;
}
