/**
 * Loading Spinner Component - Animated Loading Indicator
 * 
 * This component provides a customizable animated loading spinner for indicating
 * ongoing operations. It uses SVG and CSS animations to create a smooth spinning
 * effect that integrates well with the application's theme system.
 * 
 * Features:
 * - Customizable size with both props and inline styles
 * - Smooth CSS rotation animation
 * - Inherits text color for theme integration
 * - Additional className support for custom styling
 * - Accessible and semantic SVG implementation
 * - Lightweight and performance-optimized
 * 
 * The spinner consists of a semi-transparent circle background with a
 * highlighted arc that rotates to create the loading animation effect.
 */

'use client';

import React from 'react';

/**
 * Props interface for the LoadingSpinner component
 * 
 * @interface LoadingSpinnerProps
 * @property {number} [size] - Size of the spinner in pixels
 * @property {string} [className] - Additional CSS classes for custom styling
 */
interface LoadingSpinnerProps {
  size?: number;          // Spinner size in pixels (default: 20)
  className?: string;     // Additional CSS classes for styling
}

/**
 * LoadingSpinner Component
 * 
 * Renders an animated spinning loader using SVG and CSS animations.
 * The spinner automatically inherits the current text color and can be
 * customized with size and additional styling classes.
 * 
 * @param {LoadingSpinnerProps} props - Component props
 * @returns {JSX.Element} Rendered animated loading spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 20, 
  className = "" 
}) => {
  return (
    <svg
      className={`animate-spin h-${size/4} w-${size/4} text-white ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      style={{ width: size, height: size }}                          // Explicit size override
      role="img"                                                      // Accessibility role
      aria-label="Loading"                                            // Screen reader label
      aria-hidden="false"                                             // Announce to screen readers
    >
      {/* Background Circle - Semi-transparent base */}
      <circle
        className="opacity-25"                                        // Semi-transparent background
        cx="12"                                                       // Center X coordinate
        cy="12"                                                       // Center Y coordinate
        r="10"                                                        // Circle radius
        stroke="currentColor"                                         // Inherit text color
        strokeWidth="4"                                               // Stroke thickness
        fill="none"                                                   // No fill for circle outline
      />
      
      {/* Animated Arc - Highlighted spinning section */}
      <path
        className="opacity-75"                                        // More opaque for visibility
        fill="currentColor"                                           // Inherit text color
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"                      // Arc path definition
      />
    </svg>
  );
};

export default LoadingSpinner;
