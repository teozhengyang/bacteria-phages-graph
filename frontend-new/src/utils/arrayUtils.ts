export function moveArrayItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const newArray = [...array];
  const item = newArray.splice(fromIndex, 1)[0];
  newArray.splice(toIndex, 0, item);
  return newArray;
}

export function getFileNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}
