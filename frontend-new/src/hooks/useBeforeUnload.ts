/**
 * Before Unload Hook - Prevents Accidental Data Loss
 * 
 * This hook prevents users from accidentally losing their work by showing
 * a browser confirmation dialog when they try to leave the page with
 * unsaved changes. This is particularly important for this application
 * since users invest time in creating custom clusters and configurations.
 */

import { useEffect } from 'react';

/**
 * Hook to warn users before leaving the page with unsaved changes
 * 
 * Integrates with the browser's beforeunload event to show a confirmation
 * dialog when users try to:
 * - Close the browser tab
 * - Navigate to another page
 * - Refresh the page
 * - Close the browser window
 * 
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved modifications
 */
export function useBeforeUnload(hasUnsavedChanges: boolean) {
  useEffect(() => {
    /**
     * Handle the beforeunload event to warn about unsaved changes
     * 
     * The browser's beforeunload event allows us to intercept navigation
     * attempts and show a confirmation dialog to the user.
     * 
     * @param {BeforeUnloadEvent} e - The beforeunload event object
     */
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if there are actually unsaved changes
      if (!hasUnsavedChanges) return;
      
      // Prevent the default navigation behavior
      e.preventDefault();
      
      // Set returnValue to trigger browser confirmation dialog
      // The exact message shown is controlled by the browser, not this string
      e.returnValue = '';
    };

    // Register the event listener when the component mounts or hasUnsavedChanges changes
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Cleanup: remove the event listener when component unmounts or dependency changes
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]); // Re-run effect when hasUnsavedChanges changes
}
