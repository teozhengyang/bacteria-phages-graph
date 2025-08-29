/**
 * Session Management Utilities
 * 
 * Handles import and export of user session data, allowing users to save
 * their custom cluster configurations and restore them later. Session data
 * includes all user customizations like cluster hierarchy, bacteria assignments,
 * visibility settings, and ordering preferences.
 */

import { SessionData } from '../types';

/**
 * Export current session data to a downloadable JSON file
 * 
 * Creates a JSON file containing all user configuration data and triggers
 * a browser download. The filename is based on the original data file name
 * to help users associate sessions with their datasets.
 * 
 * @param {SessionData} sessionData - Complete session state to export
 * @param {string} originalFileName - Base filename from the original Excel file
 */
export function exportSessionData(sessionData: SessionData, originalFileName: string): void {
  // Create a JSON blob with formatted data for readability
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
    type: 'application/json',
  });

  // Generate filename based on original file name or use default
  const fileName = originalFileName ? `${originalFileName}-session.json` : 'session.json';
  
  // Create temporary download link and trigger download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click(); // Programmatically click to start download
  
  // Clean up the temporary URL to free memory
  URL.revokeObjectURL(url);
}

/**
 * Import session data from a JSON file
 * 
 * Reads and validates a session file, ensuring it contains all required
 * properties for proper application state restoration. Throws an error
 * if the file format is invalid or corrupted.
 * 
 * @param {File} file - The session JSON file to import
 * @returns {Promise<SessionData>} Parsed and validated session data
 * @throws {Error} If file format is invalid or required properties are missing
 */
export async function importSessionData(file: File): Promise<SessionData> {
  // Read file content as text
  const text = await file.text();
  
  // Parse JSON content
  const session = JSON.parse(text) as SessionData;
  
  // Validate that all required properties are present
  // This prevents corruption or partial imports that could break the application
  if (!session.allClusters || !session.visibleClusters || !session.visiblePhages || 
      !session.bacteriaClusters || !session.clusterBacteriaOrder) {
    throw new Error('Invalid session file format');
  }
  
  // Additional validation could be added here:
  // - Check that cluster names are valid strings
  // - Verify that bacteria-cluster assignments reference existing clusters
  // - Ensure visibility arrays contain valid cluster/phage names
  
  return session;
}
