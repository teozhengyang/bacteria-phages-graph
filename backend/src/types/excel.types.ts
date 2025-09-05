export interface ParsedExcelData {
    bacteriaNames: string[];    // Array of bacteria names
    interactions: number[][];   // 2D array: interactions[bacteriaIndex][phageIndex] = 0 or 1
    phageNames: string[];       // Array of phage names  
}
