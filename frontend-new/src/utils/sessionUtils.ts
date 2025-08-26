import { SessionData } from '../types';

export function exportSessionData(sessionData: SessionData, originalFileName: string): void {
  const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
    type: 'application/json',
  });

  const fileName = originalFileName ? `${originalFileName}-session.json` : 'session.json';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importSessionData(file: File): Promise<SessionData> {
  const text = await file.text();
  const session = JSON.parse(text) as SessionData;
  
  // Validate required properties
  if (!session.allClusters || !session.visibleClusters || !session.visiblePhages || 
      !session.bacteriaClusters || !session.clusterBacteriaOrder) {
    throw new Error('Invalid session file format');
  }
  
  return session;
}
